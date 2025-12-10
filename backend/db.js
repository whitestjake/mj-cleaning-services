// Database setup and connection pool configuration
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'database.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Validate required environment variables
if (!process.env.DB_NAME) {
    console.error('Error: DB_NAME environment variable is required');
    process.exit(1);
}

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
    });

// Admin management functions
async function authenticateAdmin(email, password) {
    const [rows] = await pool.query(
        'SELECT * FROM admins WHERE email = ?', 
        [email]
    );
    if (rows.length === 0) {
        return null;
    }
    const admin = rows[0];
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
        return null;
    }
    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
}

// Create new admin account
async function addAdmin(username, password, email = null) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO admins (username, email, passwordHash) VALUES (?, ?, ?)',
        [username, email, hash]
    );
}

// Client management functions
async function addClient({ firstName, lastName, address, phoneNumber, email, cardNumber, password }) {

    if (!firstName || !lastName || !email || !password) {
        throw new Error('Missing required fields');
    }
    const hash = await bcrypt.hash(password, 10);
    
    // Generate unique clientID: Simple incremental number
    const [maxIdResult] = await pool.query(
        `SELECT MAX(CAST(SUBSTRING(clientID, 2) AS UNSIGNED)) as maxId FROM clients WHERE clientID REGEXP '^[0-9]+$'`
    );
    const nextId = (maxIdResult[0].maxId || 0) + 1;
    const clientID = String(nextId).padStart(6, '0');

    await pool.query(
        `INSERT INTO clients (
            clientID, firstName, lastName, address, phoneNumber, email, cardNumber, passwordHash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientID, firstName, lastName, address, phoneNumber, email, cardNumber, hash]
    );
}
async function getClient(id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0];
}

// Get all clients (for admin/manager)
async function getAllClients() {
    const [rows] = await pool.query(`
        SELECT 
            c.id,
            c.clientID,
            c.firstName,
            c.lastName,
            c.email,
            c.phoneNumber,
            c.address,
            CONCAT(c.firstName, ' ', c.lastName) AS clientName,
            CONCAT(c.firstName, ' ', c.lastName) AS name,
            c.phoneNumber AS phone,
            CAST(COUNT(CASE WHEN sr.state = 'completed' THEN 1 END) AS UNSIGNED) AS completedRequests,
            CAST(COUNT(CASE WHEN sr.state = 'rejected' THEN 1 END) AS UNSIGNED) AS rejectedRequests,
            CAST(COUNT(sr.id) AS UNSIGNED) AS totalRequests
        FROM clients c
        LEFT JOIN service_requests sr ON c.id = sr.clientId
        GROUP BY c.id, c.firstName, c.lastName, c.email, c.phoneNumber, c.address
        ORDER BY c.lastName, c.firstName
    `);
    return rows;
}

// Client authentication
async function authenticateClient(email, password) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE email = ?', [email]);
    if (rows.length === 0) {
        return null;
    }
    const client = rows[0];
    const isValid = await bcrypt.compare(password, client.passwordHash);
    if (!isValid) {
        return null;
    }
    const { passwordHash, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
}

// Service request management functions
async function addServiceRequest({
    clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, systemEstimate, addOutdoor, note, state,
    managerQuote, scheduledTime, managerNote,
    isPaid,
    photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
}) {
    if (!clientId || !serviceType || !numRooms || !serviceDate || !state) {
        throw new Error('Missing required fields');
    }
    const [result] = await pool.query(
        `INSERT INTO service_requests (
            clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, systemEstimate, addOutdoor, note, state,
            managerQuote, scheduledTime, managerNote,
            isPaid,
            photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, systemEstimate || null, addOutdoor || false, note, state,
            managerQuote || null, scheduledTime || null, managerNote || null,
            isPaid || false,
            photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
        ]
    );
    return result.insertId;
}
// Get single service request
async function getServiceRequest(id) {
    const [rows] = await pool.query(
        `SELECT sr.*, 
                c.cardNumber,
                CONCAT(c.firstName, ' ', c.lastName) AS clientName,
                c.phoneNumber AS phone
         FROM service_requests sr
         LEFT JOIN clients c ON sr.clientId = c.id
         WHERE sr.id = ?`,
        [id]
    );
    return rows[0];
}
// Helper function to transform photo paths
function transformPhotoPathsToArray(row) {
    const baseURL = process.env.BASE_URL || 'http://localhost:5000';
    const photos = [];
    if (row.photo1Path) photos.push(`${baseURL}${row.photo1Path}`);
    if (row.photo2Path) photos.push(`${baseURL}${row.photo2Path}`);
    if (row.photo3Path) photos.push(`${baseURL}${row.photo3Path}`);
    if (row.photo4Path) photos.push(`${baseURL}${row.photo4Path}`);
    if (row.photo5Path) photos.push(`${baseURL}${row.photo5Path}`);
    return { ...row, photos: photos.length > 0 ? photos : undefined };
}

// Get all service requests
async function getServiceRequests(clientId) {
    let rows;
    if (clientId) {
        [rows] = await pool.query(
            `SELECT sr.*, 
                    c.cardNumber,
                    CONCAT(c.firstName, ' ', c.lastName) AS clientName,
                    c.phoneNumber AS phone
             FROM service_requests sr
             LEFT JOIN clients c ON sr.clientId = c.id
             WHERE sr.clientId = ?`,
            [clientId]
        );
    } else {
        [rows] = await pool.query(
            `SELECT sr.*, 
                    c.cardNumber,
                    CONCAT(c.firstName, ' ', c.lastName) AS clientName,
                    c.phoneNumber AS phone
             FROM service_requests sr
             LEFT JOIN clients c ON sr.clientId = c.id`
        );
    }
    
    return rows.map(transformPhotoPathsToArray);
}

// Update service request status
async function updateServiceRequestStatus(id, state) {
    await pool.query(
        'UPDATE service_requests SET state = ? WHERE id = ?',
        [state, id]
    );
}

// Update service request with manager data
async function updateServiceRequest(id, updates) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }
    
    if (fields.length === 0) {
        return;
    }
    
    values.push(id);
    const query = `UPDATE service_requests SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
}

// Get service requests with client information (for admin)
async function getServiceRequestsWithClient() {
    const [rows] = await pool.query(`
        SELECT 
            sr.*,
            c.firstName, c.lastName, c.email, c.phoneNumber, c.cardNumber,
            CONCAT(c.firstName, ' ', c.lastName) AS clientName,
            c.phoneNumber AS phone
        FROM service_requests sr
        JOIN clients c ON sr.clientId = c.id
        ORDER BY sr.createdAt DESC
    `);
    
    return rows.map(transformPhotoPathsToArray);
}

// ------------------- Records -------------------
// Get all records
async function getRecords(requestId) {
    if (requestId) {
        const [rows] = await pool.query(
            'SELECT * FROM records WHERE requestId = ? ORDER BY id DESC',
            [requestId]
        );
        return rows;
    } else {
        const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC');
        return rows;
    }
}

// Add quote record (admin creates quote)
async function addQuote(requestId, price, businessTime, messageBody, senderName = 'manager') {
    const [result] = await pool.query(
        `INSERT INTO records (
            itemType, requestId, price, businessTime, senderName, messageBody, state
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['quote', requestId, price, businessTime, senderName, messageBody, 'pending']
    );
    return result.insertId;
}

// Update quote record with client response
async function updateQuoteResponse(requestId, clientResponse, responseState) {
    const [result] = await pool.query(
        `UPDATE records 
         SET clientResponse = ?, responseTime = NOW(), state = ?
         WHERE requestId = ? AND itemType = 'quote' AND state = 'pending'
         ORDER BY id DESC LIMIT 1`,
        [clientResponse, responseState, requestId]
    );
    
    return result.affectedRows;
}

// Add message record
async function addMessage(requestId, senderName, messageBody) {
    await pool.query(
        `INSERT INTO records (
            itemType, requestId, senderName, messageBody, state
        ) VALUES (?, ?, ?, ?, ?)`,
        ['message', requestId, senderName, messageBody, 'sent']
    );
}

module.exports = {
    pool,
    // Admins
    addAdmin,
    authenticateAdmin,
    // Clients
    addClient,
    getClient,
    getAllClients,
    authenticateClient,
    // Service Requests
    addServiceRequest,
    getServiceRequest,
    getServiceRequests,
    getServiceRequestsWithClient,
    updateServiceRequestStatus,
    updateServiceRequest,
    // Records
    getRecords,
    addQuote,
    updateQuoteResponse,
    addMessage
};
