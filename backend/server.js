const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5000;

const db = require('./db');
const fs = require('fs');
const path = require('path');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // React dev server
    credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// Simple in-memory session store (for frontend compatibility)
const sessions = new Map();
app.use((req, res, next) => {
    // Use a simple default session for demo purposes
    const sessionId = 'default-session';
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {});
    }
    req.session = sessions.get(sessionId);
    req.sessionId = sessionId;
    next();
});

// Simple session-based authentication
const requireSession = (req, res, next) => {
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Login required' });
    }
    next();
};

// Error handling middleware
const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Generic error handler
const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
};



// AUTHENTICATION ROUTES



// Session-based login for frontend compatibility
app.post('/api/login', handleAsync(async (req, res) => {

    const { email, password } = req.body;
    
    // Try client login first

    let user = await db.authenticateClient(email, password);
    if (user) {

        req.session.userId = user.client_id;
        req.session.role = 'client';
        sessions.set(req.sessionId, req.session);
        return res.json({ id: user.client_id, role: 'client', ...user });
    }
    
    // Try admin login (support both username and email)

    user = await db.authenticateAdmin(email, password);
    if (user) {

        req.session.userId = user.admin_id;
        req.session.role = 'manager'; // Use 'manager' for frontend compatibility
        sessions.set(req.sessionId, req.session);
        return res.json({ id: user.admin_id, role: 'manager', ...user });
    }
    

    res.status(401).json({ error: 'Invalid credentials' });
}));

// Simple client login endpoint (for frontend hardcoded buttons)
app.post('/api/client-login', handleAsync(async (req, res) => {

    // For demo purposes - create a default client session
    req.session.userId = 1; // Default client ID
    req.session.role = 'client';
    sessions.set(req.sessionId, req.session);

    res.json({ id: 1, role: 'client', message: 'Client logged in successfully' });
}));

// Simple manager login endpoint (for frontend hardcoded buttons)
app.post('/api/manager-login', handleAsync(async (req, res) => {
    // For demo purposes - create a default admin session
    req.session.userId = 1; // Default admin ID
    req.session.role = 'manager';
    sessions.set(req.sessionId, req.session);
    res.json({ id: 1, role: 'manager', message: 'Manager logged in successfully' });
}));

// Get current user session
app.get('/api/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ id: req.session.userId, role: req.session.role });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.userId = null;
    req.session.role = null;
    sessions.set(req.sessionId, req.session);
    res.json({ message: 'Logged out successfully' });
});




// CLIENT MANAGEMENT ROUTES

app.post('/api/clients', handleAsync(async (req, res) => {

    
    try {
        await db.addClient(req.body);

        res.json({ message: 'Client registered' });
    } catch (error) {
        console.error('Client registration failed:', error.message);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Re-throw to let the error handler deal with it
        throw error;
    }
}));

app.get('/api/dashboard', requireSession, handleAsync(async (req, res) => {
    if (req.session.role === 'client') {
        const clientId = req.session.userId;
        const client = await db.getClient(clientId);
        const requests = await db.getServiceRequests(clientId);
        
        res.json({
            client,
            requests,
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.state === 'pending').length,
            completedRequests: requests.filter(r => r.state === 'accepted').length
        });
    } else if (req.session.role === 'manager') {
        const requests = await db.getServiceRequestsWithClient();
        res.json({ requests });
    }
}));


// FILE UPLOAD CONFIGURATION

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}-${Math.round(Math.random() * 1E9)}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));



// Frontend-compatible form submission endpoint
app.post('/submit', upload.array('photos', 5), handleAsync(async (req, res) => {

    
    // Extract form data
    const {
        serviceType,
        numRooms,
        serviceDate,
        serviceAddress,
        clientBudget,
        addOutdoor
    } = req.body;
    
    // Get client ID from session (for frontend compatibility)
    const clientId = req.session?.userId;
    if (!clientId || req.session?.role !== 'client') {

        return res.status(401).json({ error: 'Client login required' });
    }
    

    
    // Handle uploaded photos
    const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Create service request with frontend-matching field names
    const requestData = {
        client_id: clientId,
        serviceType: serviceType,
        numRooms: parseInt(numRooms) || 1,
        serviceDate: serviceDate,
        service_address: serviceAddress,
        clientBudget: parseFloat(clientBudget) || null,
        addOutdoor: addOutdoor === 'true' || addOutdoor === true,
        note: req.body.note || null,
        state: 'pending',
        photo1_path: photos[0] || null,
        photo2_path: photos[1] || null,
        photo3_path: photos[2] || null,
        photo4_path: photos[3] || null,
        photo5_path: photos[4] || null
    };
    

    
    await db.addServiceRequest(requestData);
    

    
    res.json({ 
        message: 'Service request submitted successfully',
        requestId: Date.now()
    });
}));


// SERVICE REQUEST MANAGEMENT

app.post('/api/requests', requireSession, handleAsync(async (req, res) => {
    if (req.session.role !== 'client') {
        return res.status(403).json({ error: 'Client access required' });
    }
    const requestData = {
        ...req.body,
        client_id: req.session.userId,
        state: req.body.state || 'pending'
    };
    await db.addServiceRequest(requestData);
    res.json({ message: 'Service request created' });
}));

app.get('/api/requests', requireSession, handleAsync(async (req, res) => {
    let rows;
    if (req.session.role === 'client') {
        rows = await db.getServiceRequests(req.session.userId);
    } else if (req.session.role === 'manager') {
        rows = await db.getServiceRequestsWithClient();
    }
    res.json(rows);
}));

app.get('/api/requests/:id', requireSession, handleAsync(async (req, res) => {
    const { id } = req.params;
    
    const row = await db.getServiceRequest(id);
    if (!row) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    if (req.session.role === 'client' && row.client_id !== req.session.userId) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(row);
}));





// SYSTEM ROUTES

app.get('/', (req, res) => {
    res.send('MJ Cleaning Services API is running!');
});


// ERROR HANDLING

// Error handling middleware must be last
app.use(errorHandler);


// SERVER STARTUP

app.listen(port, () => {
    console.log(`MJ Cleaning Services API is running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('  POST /api/login - Login');
    console.log('  POST /api/client-login - Demo client login');
    console.log('  POST /api/manager-login - Demo manager login');
    console.log('  POST /api/logout - Logout');
    console.log('  POST /api/clients - Register client');
    console.log('  GET /api/dashboard - Dashboard data');
    console.log('  POST /submit - Submit service request');
    console.log('  POST /api/requests - Create service request');
    console.log('  GET /api/requests/:id? - Get requests');
});