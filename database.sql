
-- Create database if it does not exist
CREATE DATABASE IF NOT EXISTS `mj_cleaning_services`;

-- Use the created database
USE `mj_cleaning_services`;


-- Create admins table if it does not exist
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    passwordHash VARCHAR(255) NOT NULL
);


-- Create clients table if it does not exist
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientID VARCHAR(50) UNIQUE NOT NULL,  -- Unique client ID (e.g., CL-20251208-0001)

    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    address TEXT,

    phoneNumber VARCHAR(20),
    email VARCHAR(100),
    cardNumber VARCHAR(32), 

    passwordHash VARCHAR(255) NOT NULL
);


-- Create service_requests table if it does not exist
CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clientId INT NOT NULL,

    serviceAddress TEXT,
    serviceType VARCHAR(50),        -- basic, deep, move_in, move_out, post_renovation
    numRooms INT,
    serviceDate DATETIME,

    clientBudget DECIMAL(10,2),
    systemEstimate DECIMAL(10,2),    -- Auto-calculated system estimate
    addOutdoor BOOLEAN DEFAULT FALSE,
    note TEXT,
    state VARCHAR(50),              -- new, pending_response, accepted, rejected, completed

    -- Manager/Admin fields
    managerQuote DECIMAL(10,2),
    scheduledTime DATETIME,
    managerNote TEXT,

    -- Status fields
    isPaid BOOLEAN DEFAULT FALSE,
    clientPaid BOOLEAN DEFAULT FALSE,
    completionDate DATETIME,
    isDisputed BOOLEAN DEFAULT FALSE,
    disputeNote TEXT,

    photo1Path VARCHAR(255),
    photo2Path VARCHAR(255),
    photo3Path VARCHAR(255),
    photo4Path VARCHAR(255),
    photo5Path VARCHAR(255),

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (clientId) REFERENCES clients(id)
);


-- Create records table if it does not exist
CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,

    itemType VARCHAR(20),          -- quote, message

    requestId INT,

    price DECIMAL(10,2),
    businessTime VARCHAR(100),      -- business time (not auto-generated)

    senderName VARCHAR(50),        -- manager or client
    messageBody TEXT,              -- manager's note

    clientResponse TEXT,           -- client's response (accept/reject reason)
    responseTime DATETIME,         -- when client responded
    
    state VARCHAR(50),              -- pending, accepted, rejected

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (requestId) REFERENCES service_requests(id)
);



