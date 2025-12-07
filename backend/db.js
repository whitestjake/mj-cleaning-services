// DB setup and shared helpers
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'database.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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

// ------------------- Admins -------------------

// ------------------- Clients -------------------
async function addClient({ firstName, lastName, address, phoneNumber, email, cardNumber, password }) {

    if (!firstName || !lastName || !email || !password) {
        throw new Error('Missing required fields');
    }
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO clients (
            firstName, lastName, address, phoneNumber, email, cardNumber, passwordHash
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, address, phoneNumber, email, cardNumber, hash]
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
    // Remove password from returned object
    const { passwordHash, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
}

// Admin authentication
async function authenticateAdmin(email, password) {
    // Check only email like client authentication
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
    // Remove password from returned object
    const { passwordHash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
}

// Add admin function 
async function addAdmin(username, password, email = null) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO admins (username, email, passwordHash) VALUES (?, ?, ?)',
        [username, email, hash]
    );
}

// ------------------- Service Requests -------------------
// Minimal: add, get one, list by client/all
async function addServiceRequest({
    clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, addOutdoor, note, state,
    managerQuote, scheduledTime, managerNote,
    isPaid, isDisputed, disputeNote, pendingRevision, completionDate,
    photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
}) {
    if (!clientId || !serviceType || !numRooms || !serviceDate || !state) {
        throw new Error('Missing required fields');
    }
    const [result] = await pool.query(
        `INSERT INTO service_requests (
            clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, addOutdoor, note, state,
            managerQuote, scheduledTime, managerNote,
            isPaid, isDisputed, disputeNote, pendingRevision, completionDate,
            photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            clientId, serviceAddress, serviceType, numRooms, serviceDate, clientBudget, addOutdoor || false, note, state,
            managerQuote || null, scheduledTime || null, managerNote || null,
            isPaid || false, isDisputed || false, disputeNote || null, pendingRevision || false, completionDate || null,
            photo1Path, photo2Path, photo3Path, photo4Path, photo5Path
        ]
    );
    return result.insertId;
}
// Get single service request
async function getServiceRequest(id) {
    const [rows] = await pool.query(
        `SELECT * FROM service_requests WHERE id = ?`,
        [id]
    );
    return rows[0];
}
// Get all service requests
async function getServiceRequests(clientId) {
    let rows;
    if (clientId) {
        [rows] = await pool.query(
            `SELECT sr.*, 
                    CONCAT(c.firstName, ' ', c.lastName) AS clientName,
                    c.phoneNumber AS phone
             FROM service_requests sr
             LEFT JOIN clients c ON sr.clientId = c.id
             WHERE sr.clientId = ?`,
            [clientId]
        );
    } else {
        [rows] = await pool.query(`SELECT * FROM service_requests`);
    }
    
    // Transform photo paths into array for frontend
    const rowsWithPhotos = rows.map(row => {
        const photos = [];
        if (row.photo1Path) photos.push(`http://localhost:5000${row.photo1Path}`);
        if (row.photo2Path) photos.push(`http://localhost:5000${row.photo2Path}`);
        if (row.photo3Path) photos.push(`http://localhost:5000${row.photo3Path}`);
        if (row.photo4Path) photos.push(`http://localhost:5000${row.photo4Path}`);
        if (row.photo5Path) photos.push(`http://localhost:5000${row.photo5Path}`);
        return { ...row, photos: photos.length > 0 ? photos : undefined };
    });
    
    return rowsWithPhotos;
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
            c.firstName, c.lastName, c.email, c.phoneNumber,
            CONCAT(c.firstName, ' ', c.lastName) AS clientName,
            c.phoneNumber AS phone
        FROM service_requests sr
        JOIN clients c ON sr.clientId = c.id
        ORDER BY sr.createdAt DESC
    `);
    
    // Transform photo paths into array for frontend
    const rowsWithPhotos = rows.map(row => {
        const photos = [];
        if (row.photo1Path) photos.push(`http://localhost:5000${row.photo1Path}`);
        if (row.photo2Path) photos.push(`http://localhost:5000${row.photo2Path}`);
        if (row.photo3Path) photos.push(`http://localhost:5000${row.photo3Path}`);
        if (row.photo4Path) photos.push(`http://localhost:5000${row.photo4Path}`);
        if (row.photo5Path) photos.push(`http://localhost:5000${row.photo5Path}`);
        return { ...row, photos: photos.length > 0 ? photos : undefined };
    });
    
    return rowsWithPhotos;
}

// ------------------- Records -------------------
async function addRecord({
    itemType, requestId, refId, price, businessTime, senderName, messageBody, state
}) {
    await pool.query(
        `INSERT INTO records (
            itemType, requestId, refId, price, businessTime, senderName, messageBody, state
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [itemType, requestId, refId, price, businessTime, senderName, messageBody, state]
    );
}
// Get single record
async function getRecord(id) {
    const [rows] = await pool.query(
        'SELECT * FROM records WHERE id = ?',
        [id]
    );
    return rows[0];
}
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

// Update record status
async function updateRecordStatus(id, state) {
    await pool.query(
        'UPDATE records SET state = ? WHERE id = ?',
        [state, id]
    );
}

// Add quote record (admin creates quote)
async function addQuote(requestId, price, businessTime, messageBody) {
    await pool.query(
        `INSERT INTO records (
            itemType, requestId, price, businessTime, senderName, messageBody, state
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['quote', requestId, price, businessTime, 'manager', messageBody, 'pending']
    );
}

// Add message record
async function addMessage(requestId, senderName, messageBody, refId = null) {
    const itemType = senderName === 'client' ? 'response' : 'message';
    await pool.query(
        `INSERT INTO records (
            itemType, requestId, refId, senderName, messageBody, state
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemType, requestId, refId, senderName, messageBody, 'sent']
    );
}

// ------------------- Orders -------------------
async function addOrder({ recordId }) {
    await pool.query(
        `INSERT INTO orders (recordId)
         VALUES (?)`,
        [recordId]
    );
}
// Get single order
async function getOrder(id) {
    const [rows] = await pool.query(
        'SELECT * FROM orders WHERE id = ?',
        [id]
    );
    return rows[0];
}
// Get all orders
async function getOrders(recordId) {
    if (recordId) {
        const [rows] = await pool.query(
            'SELECT * FROM orders WHERE recordId = ?',
            [recordId]
        );
        return rows;
    } else {
        const [rows] = await pool.query('SELECT * FROM orders');
        return rows;
    }
}

// ------------------- Billing (bills) -------------------
async function addBilling({
    itemType, orderId, refId, amount, state, senderName, messageBody
}) {
    await pool.query(
        `INSERT INTO bills (
            itemType, orderId, refId, amount, state, senderName, messageBody
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [itemType, orderId, refId, amount, state, senderName, messageBody]
    );
}
// Get single billing
async function getBilling(id) {
    const [rows] = await pool.query(
        'SELECT * FROM bills WHERE id = ?',
        [id]
    );
    return rows[0];
}
// Get all billing
async function getBillings(orderId) {
    if (orderId) {
        const [rows] = await pool.query(
            'SELECT * FROM bills WHERE orderId = ?',
            [orderId]
        );
        return rows;
    } else {
        const [rows] = await pool.query('SELECT * FROM bills');
        return rows;
    }
}

// Update billing status
async function updateBillingStatus(id, state) {
    await pool.query(
        'UPDATE bills SET state = ? WHERE id = ?',
        [state, id]
    );
}

// Update billing amount
async function updateBillingAmount(id, amount) {
    await pool.query(
        'UPDATE bills SET amount = ? WHERE id = ?',
        [amount, id]
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
    addRecord,
    getRecord,
    getRecords,
    updateRecordStatus,
    addQuote,
    addMessage,
    // Orders
    addOrder,
    getOrder,
    getOrders,
    // Billing
    addBilling,
    getBilling,
    getBillings,
    updateBillingStatus,
    updateBillingAmount,
};
