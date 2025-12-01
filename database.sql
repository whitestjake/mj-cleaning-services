-- Create database if it does not exist
CREATE DATABASE IF NOT EXISTS `mj-cleaning-services`;

-- Use the created database
USE `mj-cleaning-services`;


-- Create admins table if it does not exist
CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


-- Create clients table if it does not exist
CREATE TABLE IF NOT EXISTS clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT,

    phone_number VARCHAR(20),
    email VARCHAR(100),
    card_number VARCHAR(32),

    password_hash VARCHAR(255) NOT NULL
);


-- Create service_requests table if it does not exist
CREATE TABLE IF NOT EXISTS service_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,

    service_address TEXT,
    cleaning_type VARCHAR(50),      -- basic, deep, move_in, move_out, post_renovation
    room_count INT,
    time DATETIME,

    budget DECIMAL(10,2),
    note TEXT,
    state VARCHAR(50),              -- pending, rejected, quoted, accepted, cancelled

    photo1_path VARCHAR(255),
    photo2_path VARCHAR(255),
    photo3_path VARCHAR(255),
    photo4_path VARCHAR(255),
    photo5_path VARCHAR(255),

    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);


-- Create records table if it does not exist
CREATE TABLE IF NOT EXISTS records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,

    item_type VARCHAR(20),          -- record or message

    request_id INT,
    ref_id INT,

    price DECIMAL(10,2),
    time VARCHAR(100),              -- business time (not auto-generated)

    sender_name VARCHAR(50),        -- client or admin
    message_body TEXT,

    state VARCHAR(50),              -- pending, countered, accepted, rejected

    FOREIGN KEY (request_id) REFERENCES service_requests(request_id)
);


-- Create orders table if it does not exist
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,

    record_id INT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id) REFERENCES records(record_id)
);


-- Create bills table if it does not exist
CREATE TABLE IF NOT EXISTS bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,

    item_type VARCHAR(20),          -- bill or message

    order_id INT,
    ref_id INT,

    amount DECIMAL(10,2),
    state VARCHAR(50),              -- unpaid, paid, disputed

    sender_name VARCHAR(50),        -- client or admin
    message_body TEXT,

    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
