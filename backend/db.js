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
async function addClient({ first_name, last_name, address, phone_number, email, card_number, password }) {

    if (!first_name || !last_name || !email || !password) {
        throw new Error('Missing required fields');
    }
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO clients (
            first_name, last_name, address, phone_number, email, card_number, password_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, address, phone_number, email, card_number, hash]
    );
}
async function getClient(client_id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE client_id = ?', [client_id]);
    return rows[0];
}

// Client authentication
async function authenticateClient(email, password) {

    const [rows] = await pool.query('SELECT * FROM clients WHERE email = ?', [email]);

    if (rows.length === 0) {

        return null;
    }
    const client = rows[0];


    const isValid = await bcrypt.compare(password, client.password_hash);

    if (!isValid) {
        return null;
    }
    // Remove password from returned object
    const { password_hash, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
}

// Admin authentication
async function authenticateAdmin(usernameOrEmail, password) {
    // Try both username and email for flexibility
    const [rows] = await pool.query(
        'SELECT * FROM admins WHERE username = ? OR email = ?', 
        [usernameOrEmail, usernameOrEmail]
    );
    if (rows.length === 0) {
        return null;
    }
    const admin = rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
        return null;
    }
    // Remove password from returned object
    const { password_hash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
}

// Add admin function 
async function addAdmin(username, password, email = null) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
        'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)',
        [username, hash, email]
    );
}

// ------------------- Service Requests -------------------
// Minimal: add, get one, list by client/all
async function addServiceRequest({
    client_id, service_address, serviceType, numRooms, serviceDate, clientBudget, addOutdoor, note, state,
    photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
}) {
    if (!client_id || !serviceType || !numRooms || !serviceDate || !state) {
        throw new Error('Missing required fields');
    }
    await pool.query(
        `INSERT INTO service_requests (
            client_id, service_address, cleaning_type, room_count, time, budget, addOutdoor, note, state,
            photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            client_id, service_address, serviceType, numRooms, serviceDate, clientBudget, addOutdoor || false, note, state,
            photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
        ]
    );
}
// Get single service request
async function getServiceRequest(request_id) {
    const [rows] = await pool.query(
        `SELECT 
            request_id, client_id, service_address, 
            cleaning_type as serviceType, 
            room_count as numRooms, 
            time as serviceDate,
            budget as clientBudget, 
            addOutdoor,
            note, state, created_time,
            photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
        FROM service_requests WHERE request_id = ?`,
        [request_id]
    );
    return rows[0];
}
// Get all service requests
async function getServiceRequests(client_id) {
    let rows;
    if (client_id) {
        [rows] = await pool.query(
            `SELECT 
                request_id, client_id, service_address, 
                cleaning_type as serviceType, 
                room_count as numRooms, 
                time as serviceDate,
                budget as clientBudget, 
                addOutdoor,
                note, state, created_time,
                photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
            FROM service_requests WHERE client_id = ?`,
            [client_id]
        );
    } else {
        [rows] = await pool.query(
            `SELECT 
                request_id, client_id, service_address, 
                cleaning_type as serviceType, 
                room_count as numRooms, 
                time as serviceDate,
                budget as clientBudget, 
                addOutdoor,
                note, state, created_time,
                photo1_path, photo2_path, photo3_path, photo4_path, photo5_path
            FROM service_requests`
        );
    }
    return rows;
}

// Update service request status
async function updateServiceRequestStatus(request_id, state) {
    await pool.query(
        'UPDATE service_requests SET state = ? WHERE request_id = ?',
        [state, request_id]
    );
}

// Get service requests with client information (for admin)
async function getServiceRequestsWithClient() {
    const [rows] = await pool.query(`
        SELECT 
            sr.request_id, sr.client_id, sr.service_address, 
            sr.cleaning_type as serviceType, 
            sr.room_count as numRooms, 
            sr.time as serviceDate,
            sr.budget as clientBudget, 
            sr.addOutdoor,
            sr.note, sr.state, sr.created_time,
            sr.photo1_path, sr.photo2_path, sr.photo3_path, sr.photo4_path, sr.photo5_path,
            c.first_name, c.last_name, c.email, c.phone_number
        FROM service_requests sr
        JOIN clients c ON sr.client_id = c.client_id
        ORDER BY sr.created_time DESC
    `);
    return rows;
}

// ------------------- Records -------------------
async function addRecord({
    item_type, request_id, ref_id, price, time, sender_name, message_body, state
}) {
    await pool.query(
        `INSERT INTO records (
            item_type, request_id, ref_id, price, time, sender_name, message_body, state
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item_type, request_id, ref_id, price, time, sender_name, message_body, state]
    );
}
// Get single record
async function getRecord(record_id) {
    const [rows] = await pool.query(
        'SELECT * FROM records WHERE record_id = ?',
        [record_id]
    );
    return rows[0];
}
// Get all records
async function getRecords(request_id) {
    let rows;
    if (request_id) {
        [rows] = await pool.query(
            'SELECT * FROM records WHERE request_id = ? ORDER BY record_id DESC',
            [request_id]
        );
    } else {
        [rows] = await pool.query('SELECT * FROM records ORDER BY record_id DESC');
    }
    return rows;
}

// Update record status
async function updateRecordStatus(record_id, state) {
    await pool.query(
        'UPDATE records SET state = ? WHERE record_id = ?',
        [state, record_id]
    );
}

// Add quote record (admin creates quote)
async function addQuote(request_id, price, time, message_body) {
    await pool.query(
        `INSERT INTO records (
            item_type, request_id, price, time, sender_name, message_body, state
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['record', request_id, price, time, 'admin', message_body, 'pending']
    );
}

// Add message record
async function addMessage(request_id, sender_name, message_body, ref_id = null) {
    await pool.query(
        `INSERT INTO records (
            item_type, request_id, ref_id, sender_name, message_body, state
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        ['message', request_id, ref_id, sender_name, message_body, 'sent']
    );
}

// ------------------- Orders -------------------
async function addOrder({ record_id }) {
    await pool.query(
        `INSERT INTO orders (record_id)
         VALUES (?)`,
        [record_id]
    );
}
// Get single order
async function getOrder(order_id) {
    const [rows] = await pool.query(
        'SELECT * FROM orders WHERE order_id = ?',
        [order_id]
    );
    return rows[0];
}
// Get all orders
async function getOrders(record_id) {
    let rows;
    if (record_id) {
        [rows] = await pool.query(
            'SELECT * FROM orders WHERE record_id = ?',
            [record_id]
        );
    } else {
        [rows] = await pool.query('SELECT * FROM orders');
    }
    return rows;
}

// ------------------- Billing (bills) -------------------
async function addBilling({
    item_type, order_id, ref_id, amount, state, sender_name, message_body
}) {
    await pool.query(
        `INSERT INTO bills (
            item_type, order_id, ref_id, amount, state, sender_name, message_body
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [item_type, order_id, ref_id, amount, state, sender_name, message_body]
    );
}
// Get single billing
async function getBilling(bill_id) {
    const [rows] = await pool.query(
        'SELECT * FROM bills WHERE bill_id = ?',
        [bill_id]
    );
    return rows[0];
}
// Get all billing
async function getBillings(order_id) {
    let rows;
    if (order_id) {
        [rows] = await pool.query(
            'SELECT * FROM bills WHERE order_id = ?',
            [order_id]
        );
    } else {
        [rows] = await pool.query('SELECT * FROM bills');
    }
    return rows;
}

// Update billing status
async function updateBillingStatus(bill_id, state) {
    await pool.query(
        'UPDATE bills SET state = ? WHERE bill_id = ?',
        [state, bill_id]
    );
}

// Update billing amount
async function updateBillingAmount(bill_id, amount) {
    await pool.query(
        'UPDATE bills SET amount = ? WHERE bill_id = ?',
        [amount, bill_id]
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
    authenticateClient,
    // Service Requests
    addServiceRequest,
    getServiceRequest,
    getServiceRequests,
    getServiceRequestsWithClient,
    updateServiceRequestStatus,
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
