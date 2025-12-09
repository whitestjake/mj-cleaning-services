const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'database.env') });

// Import database functions
const {
    pool,
    addClient,
    authenticateClient,
    authenticateAdmin,
    getClient,
    getAllClients,
    addServiceRequest,
    getServiceRequest,
    getServiceRequests,
    getServiceRequestsWithClient,
    updateServiceRequestStatus,
    updateServiceRequest,
    getRecords,
    addQuote,
    updateQuoteResponse,
    addMessage
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('\nWARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable in production!\n');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Get current user profile
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const client = await getClient(req.user.id);
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    // Remove sensitive data
    delete client.password;
    res.json({ success: true, user: client });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user profile' });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, address, phoneNumber, email, cardNumber, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: firstName, lastName, email, password' 
      });
    }

    // Use database function to add client
    await addClient({ 
      firstName, 
      lastName, 
      address, 
      phoneNumber, 
      email, 
      cardNumber, 
      password 
    });
    
    res.json({ 
      success: true, 
      message: 'Registration successful! Please login.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed. Please try again.' 
      });
    }
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for admin login first
    const admin = await authenticateAdmin(email, password);
    if (admin) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'manager' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        role: 'manager',
        token,
        user: { id: admin.id, email: admin.email, role: 'manager' }
      });
    }

    // Try client authentication
    const client = await authenticateClient(email, password);
    if (!client) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: client.id, email: client.email, role: 'client' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      role: 'client',
      token,
      user: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        role: 'client'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Service request endpoints
app.post('/api/service-requests', authenticateToken, upload.array('photos', 5), async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can create service requests' });
    }

    const {
      serviceAddress,
      serviceType,
      numRooms,
      serviceDate,
      clientBudget,
      systemEstimate,
      addOutdoor,
      note
    } = req.body;

    // Handle uploaded photos
    const photoPaths = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        photoPaths[`photo${index + 1}Path`] = `/uploads/${file.filename}`;
      });
    }

    const requestData = {
      clientId: req.user.id,
      serviceAddress,
      serviceType,
      numRooms: parseInt(numRooms) || 0,
      serviceDate: new Date(serviceDate),
      clientBudget: clientBudget ? parseFloat(clientBudget) : null,
      systemEstimate: systemEstimate ? parseFloat(systemEstimate) : null,
      addOutdoor: addOutdoor === 'true' || addOutdoor === true,
      note,
      state: 'new',
      ...photoPaths
    };

    const requestId = await addServiceRequest(requestData);
    
    // Create initial client quote record if budget is provided
    if (clientBudget && parseFloat(clientBudget) > 0) {
      await addQuote(
        requestId,
        parseFloat(clientBudget),
        serviceDate,
        note || 'Initial client budget',
        'client'
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Service request created successfully',
      id: requestId 
    });
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create service request' 
    });
  }
});

app.get('/api/service-requests', authenticateToken, async (req, res) => {
  try {
    let requests;
    
    if (req.user.role === 'client') {
      // Client can only see their own requests
      requests = await getServiceRequests(req.user.id);
    } else if (req.user.role === 'manager') {
      // Manager can see all requests with optional status filter
      const { status } = req.query;
      let allRequests = await getServiceRequestsWithClient();
      
      // Filter by status if provided
      if (status) {
        requests = allRequests.filter(req => req.state === status);
      } else {
        requests = allRequests;
      }
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service requests' 
    });
  }
});

// Get specific service request
app.get('/api/service-requests/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await getServiceRequest(requestId);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service request not found' 
      });
    }

    // Check access permissions
    if (req.user.role === 'client' && request.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }    res.json({ success: true, request });
  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service request' 
    });
  }
});

// Update service request
app.put('/api/service-requests/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const updates = req.body;
    
    // Get the request to check permissions
    const request = await getServiceRequest(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service request not found' 
      });
    }
    
    // Managers can update any request
    // Clients can only update their own requests and only state transitions
    if (req.user.role === 'manager') {
      // Manager can update anything
      await updateServiceRequest(requestId, updates);
    } else if (req.user.role === 'client') {
      // Client can only update their own requests
      if (request.clientId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }
      // Clients can only update state, payment, and renegotiation fields
      const allowedFields = ['state', 'clientAdjustment', 'isRenegotiation', 'clientPaid', 'isDisputed', 'disputeNote'];
      const clientUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          clientUpdates[key] = value;
        }
      }
      await updateServiceRequest(requestId, clientUpdates);
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Service request updated successfully' 
    });
  } catch (error) {
    console.error('Update service request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update service request' 
    });
  }
});

// Update service request status
app.put('/api/service-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    
    // Get the request to check permissions
    const request = await getServiceRequest(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service request not found' 
      });
    }
    
    // Managers can update any status
    // Clients can only update status for their own requests and only specific transitions
    if (req.user.role === 'manager') {
      await updateServiceRequestStatus(requestId, status);
    } else if (req.user.role === 'client') {
      // Client can only update their own requests
      if (request.clientId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }
      // Clients can only accept (pending_response -> accepted) or reject
      const allowedTransitions = {
        'pending_response': ['accepted', 'rejected', 'new']
      };
      const currentState = request.state;
      if (!allowedTransitions[currentState] || !allowedTransitions[currentState].includes(status)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid status transition' 
        });
      }
      await updateServiceRequestStatus(requestId, status);
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Request status updated successfully' 
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update request status' 
    });
  }
});

// Client disputes a bill
app.post('/api/service-requests/:id/dispute', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { disputeNote } = req.body;

    // Verify request exists and client owns it
    const request = await getServiceRequest(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service request not found' 
      });
    }

    if (req.user.role === 'client' && request.clientId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Update request with dispute information
    await updateServiceRequest(requestId, { 
      isDisputed: true, 
      disputeNote: disputeNote 
    });

    // Add a record for the dispute
    await addMessage(requestId, 'client', `Bill disputed: ${disputeNote}`);

    res.json({ 
      success: true, 
      message: 'Dispute submitted successfully' 
    });
  } catch (error) {
    console.error('Dispute bill error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit dispute' 
    });
  }
});

// Get all clients (for manager)
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only managers can view clients' 
      });
    }

    const clients = await getAllClients();
    res.json({ success: true, clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch clients' 
    });
  }
});

// Get communication records for a request
app.get('/api/service-requests/:id/records', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const records = await getRecords(requestId);
    res.json({ success: true, records });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch communication records' 
    });
  }
});

// Add negotiation record
app.post('/api/service-requests/:id/records', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { itemType, price, businessTime, messageBody, senderName: requestedSenderName } = req.body;
    // Use the senderName from request body if provided, otherwise use user's role from token
    const senderName = requestedSenderName || req.user.role;
    
    if (itemType === 'quote') {
      await addQuote(requestId, price, businessTime, messageBody, senderName);
    } else if (itemType === 'response') {
      await addMessage(requestId, senderName, messageBody);
    } else {
      await addMessage(requestId, senderName, messageBody);
    }
    
    res.json({ success: true, message: 'Record created successfully' });
  } catch (error) {
    console.error('Add record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create record' 
    });
  }
});

// Update quote with client response
app.put('/api/service-requests/:id/quote-response', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { clientResponse, state } = req.body;
    
    const affectedRows = await updateQuoteResponse(requestId, clientResponse, state);
    
    if (affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No pending quote found to update' 
      });
    }
    
    res.json({ success: true, message: 'Quote response updated successfully' });
  } catch (error) {
    console.error('Update quote response error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update quote response' 
    });
  }
});

// Add communication message
app.post('/api/service-requests/:id/message', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { message } = req.body;
    const senderName = req.user.role;
    
    await addMessage(requestId, senderName, message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
});

// ==================== Statistics/Reports API ====================

// 1. Frequent clients - clients with most completed orders
app.get('/api/statistics/frequent-clients', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.clientID, 
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        c.email,
        COUNT(sr.id) AS completedOrders
      FROM clients c
      INNER JOIN service_requests sr ON c.id = sr.clientId
      WHERE sr.state = 'completed'
      GROUP BY c.id, c.clientID, c.firstName, c.lastName, c.email
      ORDER BY completedOrders DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Frequent clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 2. Uncommitted clients - 3+ requests but never completed
app.get('/api/statistics/uncommitted-clients', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        c.email,
        COUNT(sr.id) AS totalRequests,
        SUM(CASE WHEN sr.state = 'completed' THEN 1 ELSE 0 END) AS completedOrders
      FROM clients c
      INNER JOIN service_requests sr ON c.id = sr.clientId
      GROUP BY c.id, c.clientID, c.firstName, c.lastName, c.email
      HAVING totalRequests >= 3 AND completedOrders = 0
      ORDER BY totalRequests DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Uncommitted clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 3. This month's accepted quotes
app.get('/api/statistics/monthly-quotes', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.query; // e.g., year=2024, month=12
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        sr.serviceType,
        sr.managerQuote AS agreedPrice,
        sr.createdAt AS quoteDate
      FROM service_requests sr
      INNER JOIN clients c ON sr.clientId = c.id
      WHERE sr.state IN ('accepted', 'completed')
        AND YEAR(sr.createdAt) = ?
        AND MONTH(sr.createdAt) = ?
      GROUP BY sr.id, c.clientID, c.firstName, c.lastName, sr.serviceType, sr.managerQuote, sr.createdAt
      ORDER BY sr.createdAt DESC
    `, [year || new Date().getFullYear(), month || new Date().getMonth() + 1]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Monthly quotes error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 4. Prospective clients - registered but never submitted request
app.get('/api/statistics/prospective-clients', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        c.email,
        c.phoneNumber
      FROM clients c
      LEFT JOIN service_requests sr ON c.id = sr.clientId
      WHERE sr.id IS NULL
      ORDER BY c.clientID DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Prospective clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 5. Largest jobs - most rooms completed
app.get('/api/statistics/largest-jobs', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        sr.serviceType,
        sr.numRooms,
        sr.serviceAddress,
        sr.completionDate
      FROM service_requests sr
      INNER JOIN clients c ON sr.clientId = c.id
      WHERE sr.state = 'completed'
      GROUP BY sr.id, c.clientID, c.firstName, c.lastName, sr.serviceType, sr.numRooms, sr.serviceAddress, sr.completionDate
      ORDER BY sr.numRooms DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Largest jobs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 6. Overdue bills - unpaid bills older than 1 week
app.get('/api/statistics/overdue-bills', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        sr.id,
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        sr.serviceType,
        sr.managerQuote AS billAmount,
        sr.completionDate,
        DATEDIFF(NOW(), sr.completionDate) AS daysOverdue
      FROM service_requests sr
      INNER JOIN clients c ON sr.clientId = c.id
      WHERE sr.state = 'completed'
        AND sr.isPaid = FALSE
        AND sr.completionDate < DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY sr.id, c.clientID, c.firstName, c.lastName, sr.serviceType, sr.managerQuote, sr.completionDate
      ORDER BY daysOverdue DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Overdue bills error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 7. Bad clients - never paid overdue bills
app.get('/api/statistics/bad-clients', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        c.email,
        COUNT(sr.id) AS overdueCount,
        SUM(sr.managerQuote) AS totalOwed
      FROM clients c
      INNER JOIN service_requests sr ON c.id = sr.clientId
      WHERE sr.state = 'completed'
        AND sr.isPaid = FALSE
        AND sr.completionDate < DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY c.id, c.clientID, c.firstName, c.lastName, c.email
      ORDER BY overdueCount DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Bad clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// 8. Good clients - always paid within 24 hours
app.get('/api/statistics/good-clients', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.clientID,
        CONCAT(c.firstName, ' ', c.lastName) AS clientName,
        c.email,
        COUNT(sr.id) AS totalCompletedOrders
      FROM clients c
      INNER JOIN service_requests sr ON c.id = sr.clientId
      WHERE sr.state = 'completed'
      GROUP BY c.id, c.clientID, c.firstName, c.lastName, c.email
      HAVING 
        totalCompletedOrders > 0
        AND SUM(
          CASE 
            WHEN sr.isPaid = FALSE
             AND sr.completionDate IS NOT NULL
             AND sr.completionDate <= NOW() - INTERVAL 1 DAY
            THEN 1 ELSE 0
          END
        ) = 0
      ORDER BY totalCompletedOrders DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Good clients error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: 'File too large. Maximum size is 10MB.' 
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});




