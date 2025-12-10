-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 10, 2025 at 02:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mj_cleaning_services`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `passwordHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `passwordHash`) VALUES
(1, 'mhw', '1@qq.com', '$2b$10$BqcHUUZ0//h1AUYmxczruOh8.x.tYb0dWO.Rr5C7iocC568ocZpgW');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `clientID` varchar(50) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `cardNumber` varchar(32) DEFAULT NULL,
  `passwordHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `clientID`, `firstName`, `lastName`, `address`, `phoneNumber`, `email`, `cardNumber`, `passwordHash`) VALUES
(1, 'C001', 'John', 'Smith', '123 Main St, Toronto', '416-555-0101', 'john.smith@email.com', '4532123456789012', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(2, 'C002', 'Sarah', 'Johnson', '456 Oak Ave, Mississauga', '905-555-0202', 'sarah.j@email.com', '5412987654321098', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(3, 'C003', 'Michael', 'Brown', '789 Pine Rd, Brampton', '647-555-0303', 'mbrown@email.com', '4716543210987654', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(4, 'C004', 'Emily', 'Davis', '321 Elm St, Oakville', '289-555-0404', 'emily.davis@email.com', '5523456789012345', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(5, 'C005', 'Robert', 'Wilson', '654 Maple Dr, Burlington', '905-555-0505', 'rwilson@email.com', '4929876543210123', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(6, 'C006', 'Lisa', 'Anderson', '987 Cedar Ln, Hamilton', '905-555-0606', 'lisa.a@email.com', '4485123456789876', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(7, 'C007', 'David', 'Taylor', '147 Birch St, Markham', '416-555-0707', 'dtaylor@email.com', '5198765432109876', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(8, 'C008', 'Jennifer', 'Martinez', '258 Spruce Ave, Richmond Hill', '647-555-0808', 'jmartinez@email.com', '4556789012345678', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(9, 'C009', 'James', 'Garcia', '369 Walnut Rd, Vaughan', '905-555-0909', 'jgarcia@email.com', '5276543210987654', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(10, 'C010', 'Amanda', 'Rodriguez', '741 Ash Dr, Aurora', '289-555-1010', 'arodriguez@email.com', '4391234567890123', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(11, 'C011', 'William', 'Lee', '852 Poplar Ln, Newmarket', '905-555-1111', 'wlee@email.com', '5147890123456789', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(12, 'C012', 'Jessica', 'White', '963 Willow St, Pickering', '416-555-1212', 'jwhite@email.com', '4662345678901234', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(13, 'C013', 'Daniel', 'Harris', '456 Maple Ave, Oakville', '905-555-1313', 'dharris@email.com', '4532876543210987', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(14, 'C014', 'Sophia', 'Clark', '789 Oak St, Burlington', '289-555-1414', 'sclark@email.com', '5412345678901234', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCD'),
(15, '000001', 'mh', '2', '123', '123', '2@qq.com', '123', '$2b$10$CQegsvgY9viQ0IGBDUVLXe4RJs38.8dnfImOP031DZwP/ua9LjYZG');

-- --------------------------------------------------------

--
-- Table structure for table `records`
--

CREATE TABLE `records` (
  `id` int(11) NOT NULL,
  `itemType` varchar(20) DEFAULT NULL,
  `requestId` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `businessTime` varchar(100) DEFAULT NULL,
  `senderName` varchar(50) DEFAULT NULL,
  `messageBody` text DEFAULT NULL,
  `clientResponse` text DEFAULT NULL,
  `responseTime` datetime DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `records`
--

INSERT INTO `records` (`id`, `itemType`, `requestId`, `price`, `businessTime`, `senderName`, `messageBody`, `clientResponse`, `responseTime`, `state`, `createdAt`) VALUES
(1, 'quote', 6, 200.00, '2025-12-15 10:00-13:00', 'manager', 'Quote', 'Accepted', '2025-12-02 10:00:00', 'accepted', '2025-12-01 10:00:00'),
(2, 'quote', 20, 210.00, '2025-12-20 09:00-13:00', 'manager', 'Holiday quote', 'Accepted', '2025-12-05 15:00:00', 'accepted', '2025-12-05 11:00:00'),
(3, 'quote', 21, 150.00, '2025-12-22 10:00-13:00', 'manager', 'Pre-holiday', 'Accepted', '2025-12-06 16:00:00', 'accepted', '2025-12-06 12:00:00'),
(4, 'quote', 35, 22.00, '2025-12-10 00:00:00', 'client', 'a', NULL, NULL, 'pending', '2025-12-09 20:08:07'),
(5, 'quote', 35, 44.00, '2025-12-10T07:00', 'manager', 'b', 'Counter-offer: $33. c', '2025-12-09 20:08:40', 'rejected', '2025-12-09 20:08:23'),
(6, 'quote', 35, 33.00, NULL, 'client', 'c', NULL, NULL, 'pending', '2025-12-09 20:08:40'),
(7, 'quote', 35, 33.00, '2025-12-10T12:00', 'manager', 'd', NULL, NULL, 'pending', '2025-12-09 20:08:49'),
(8, 'message', 35, NULL, NULL, 'manager', 'Service completed. Bill generated.', NULL, NULL, 'sent', '2025-12-09 20:08:57'),
(9, 'message', 35, NULL, NULL, 'client', 'Client completed payment of $33.00', NULL, NULL, 'sent', '2025-12-09 20:09:09'),
(10, 'message', 35, NULL, NULL, 'manager', 'Manager confirmed payment received', NULL, NULL, 'sent', '2025-12-09 20:09:15');

-- --------------------------------------------------------

--
-- Table structure for table `service_requests`
--

CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `serviceAddress` text DEFAULT NULL,
  `serviceType` varchar(50) DEFAULT NULL,
  `numRooms` int(11) DEFAULT NULL,
  `serviceDate` datetime DEFAULT NULL,
  `clientBudget` decimal(10,2) DEFAULT NULL,
  `systemEstimate` decimal(10,2) DEFAULT NULL,
  `addOutdoor` tinyint(1) DEFAULT 0,
  `note` text DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `managerQuote` decimal(10,2) DEFAULT NULL,
  `scheduledTime` datetime DEFAULT NULL,
  `managerNote` text DEFAULT NULL,
  `isPaid` tinyint(1) DEFAULT 0,
  `clientPaid` tinyint(1) DEFAULT 0,
  `completionDate` datetime DEFAULT NULL,
  `isDisputed` tinyint(1) DEFAULT 0,
  `disputeNote` text DEFAULT NULL,
  `photo1Path` varchar(255) DEFAULT NULL,
  `photo2Path` varchar(255) DEFAULT NULL,
  `photo3Path` varchar(255) DEFAULT NULL,
  `photo4Path` varchar(255) DEFAULT NULL,
  `photo5Path` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_requests`
--

INSERT INTO `service_requests` (`id`, `clientId`, `serviceAddress`, `serviceType`, `numRooms`, `serviceDate`, `clientBudget`, `systemEstimate`, `addOutdoor`, `note`, `state`, `managerQuote`, `scheduledTime`, `managerNote`, `isPaid`, `clientPaid`, `completionDate`, `isDisputed`, `disputeNote`, `photo1Path`, `photo2Path`, `photo3Path`, `photo4Path`, `photo5Path`, `createdAt`) VALUES
(1, 1, '123 Main St, Toronto', 'Basic', 3, '2025-11-15 09:00:00', 150.00, 150.00, 0, 'Regular', 'completed', 150.00, '2025-11-15 09:00:00', NULL, 1, 1, '2025-11-15 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-10 15:00:00'),
(2, 1, '123 Main St, Toronto', 'Basic', 3, '2025-11-22 09:00:00', 150.00, 150.00, 0, 'Regular', 'completed', 150.00, '2025-11-22 09:00:00', NULL, 1, 1, '2025-11-22 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-17 15:00:00'),
(3, 2, '456 Oak Ave, Mississauga', 'Basic', 4, '2025-11-20 10:00:00', 200.00, 200.00, 0, 'Cleaning', 'completed', 200.00, '2025-11-20 10:00:00', NULL, 1, 1, '2025-11-20 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-15 14:00:00'),
(4, 4, '321 Elm St, Oakville', 'Basic', 3, '2025-11-10 10:00:00', 150.00, 150.00, 0, 'First quote', 'quoted', 150.00, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-05 14:00:00'),
(5, 4, '321 Elm St, Oakville', 'Basic', 3, '2025-11-20 10:00:00', 150.00, 150.00, 0, 'Second quote', 'quoted', 150.00, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-15 15:00:00'),
(6, 4, '321 Elm St, Oakville', 'Deep Clean', 3, '2025-11-25 10:00:00', 210.00, 210.00, 0, 'Third quote', 'quoted', 210.00, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 15:00:00'),
(7, 7, '147 Birch St, Markham', 'Basic', 4, '2025-12-15 10:00:00', 200.00, 200.00, 0, 'Holiday', 'accepted', 200.00, '2025-12-15 10:00:00', NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 14:00:00'),
(8, 3, '789 Pine Rd, Brampton', 'Deep Clean', 6, '2025-11-25 08:00:00', 280.00, 280.00, 0, 'Large', 'completed', 280.00, '2025-11-25 08:00:00', NULL, 1, 1, '2025-11-25 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-20 15:00:00'),
(9, 11, '852 Poplar Ln, Newmarket', 'Basic', 3, '2025-11-24 10:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-24 10:00:00', NULL, 0, 0, '2025-11-24 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-19 14:00:00'),
(10, 12, '963 Willow St, Pickering', 'Basic', 3, '2025-11-22 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-22 09:00:00', NULL, 0, 0, '2025-11-22 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-17 15:00:00'),
(11, 13, '456 Maple Ave, Oakville', 'Basic', 3, '2025-11-16 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-16 09:00:00', NULL, 1, 1, '2025-11-16 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-11 15:00:00'),
(12, 13, '456 Maple Ave, Oakville', 'Deep Clean', 3, '2025-11-23 09:00:00', 210.00, 210.00, 0, 'Service', 'completed', 210.00, '2025-11-23 09:00:00', NULL, 1, 1, '2025-11-23 14:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-18 15:00:00'),
(13, 14, '789 Oak St, Burlington', 'Basic', 4, '2025-11-17 10:00:00', 200.00, 200.00, 0, 'Service', 'completed', 200.00, '2025-11-17 10:00:00', NULL, 1, 1, '2025-11-17 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-12 14:00:00'),
(14, 14, '789 Oak St, Burlington', 'Basic', 4, '2025-11-24 10:00:00', 200.00, 200.00, 0, 'Service', 'completed', 200.00, '2025-11-24 10:00:00', NULL, 1, 1, '2025-11-24 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-19 14:00:00'),
(15, 6, '987 Cedar Ln, Hamilton', 'Basic', 3, '2025-11-18 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-18 09:00:00', NULL, 1, 1, '2025-11-18 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-13 15:00:00'),
(16, 8, '258 Spruce Ave, Richmond Hill', 'Basic', 3, '2025-11-19 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-19 09:00:00', NULL, 1, 1, '2025-11-19 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-14 15:00:00'),
(17, 9, '369 Walnut Rd, Vaughan', 'Basic', 3, '2025-11-20 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-20 09:00:00', NULL, 1, 1, '2025-11-20 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-15 15:00:00'),
(18, 10, '741 Ash Dr, Aurora', 'Basic', 3, '2025-11-21 09:00:00', 150.00, 150.00, 0, 'Service', 'completed', 150.00, '2025-11-21 09:00:00', NULL, 1, 1, '2025-11-21 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-16 15:00:00'),
(19, 1, '123 Main St, Toronto', 'Basic', 3, '2025-11-29 09:00:00', 150.00, 150.00, 0, 'Weekly', 'completed', 150.00, '2025-11-29 09:00:00', NULL, 1, 1, '2025-11-29 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-24 15:00:00'),
(20, 1, '123 Main St, Toronto', 'Deep Clean', 3, '2025-12-03 09:00:00', 210.00, 210.00, 0, 'Deep', 'completed', 210.00, '2025-12-03 09:00:00', NULL, 1, 1, '2025-12-03 14:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 15:00:00'),
(21, 1, '123 Main St, Toronto', 'Basic', 3, '2025-12-06 09:00:00', 150.00, 150.00, 0, 'Regular', 'completed', 150.00, '2025-12-06 09:00:00', NULL, 1, 1, '2025-12-06 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 15:00:00'),
(22, 2, '456 Oak Ave, Mississauga', 'Basic', 4, '2025-11-27 10:00:00', 200.00, 200.00, 0, 'Bi-weekly', 'completed', 200.00, '2025-11-27 10:00:00', NULL, 1, 1, '2025-11-27 13:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-22 14:00:00'),
(23, 2, '456 Oak Ave, Mississauga', 'Deep Clean', 4, '2025-12-04 10:00:00', 280.00, 280.00, 0, 'Monthly', 'completed', 280.00, '2025-12-04 10:00:00', NULL, 1, 1, '2025-12-04 15:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:00:00'),
(24, 4, '321 Elm St, Oakville', 'Basic', 3, '2025-11-28 10:00:00', 150.00, 150.00, 0, 'Fourth quote', 'quoted', 150.00, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-23 15:00:00'),
(25, 6, '987 Cedar Ln, Hamilton', 'Deep Clean', 3, '2025-12-20 09:00:00', 210.00, 210.00, 0, 'Holiday', 'accepted', 210.00, '2025-12-20 09:00:00', NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-05 15:00:00'),
(26, 8, '258 Spruce Ave, Richmond Hill', 'Basic', 3, '2025-12-22 10:00:00', 150.00, 150.00, 0, 'Pre-holiday', 'accepted', 150.00, '2025-12-22 10:00:00', NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 16:00:00'),
(27, 5, '654 Maple Dr, Burlington', 'Basic', 4, '2025-12-07 09:00:00', 200.00, 200.00, 0, 'First inquiry', 'pending', NULL, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-05 14:00:00'),
(28, 9, '369 Walnut Rd, Vaughan', 'Move Out', 8, '2025-12-07 08:00:00', 550.00, 560.00, 1, 'Mansion', 'completed', 580.00, '2025-12-07 08:00:00', NULL, 1, 1, '2025-12-07 16:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 15:00:00'),
(29, 11, '852 Poplar Ln, Newmarket', 'Deep Clean', 3, '2025-11-20 10:00:00', 210.00, 210.00, 0, 'Not paid', 'completed', 210.00, '2025-11-20 10:00:00', NULL, 0, 0, '2025-11-20 14:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-15 14:00:00'),
(30, 10, '741 Ash Dr, Aurora', 'Basic', 3, '2025-11-23 09:00:00', 150.00, 150.00, 0, 'Overdue', 'completed', 150.00, '2025-11-23 09:00:00', NULL, 0, 0, '2025-11-23 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-18 15:00:00'),
(31, 12, '963 Willow St, Pickering', 'Deep Clean', 3, '2025-11-18 09:00:00', 210.00, 210.00, 0, 'Never paid', 'completed', 210.00, '2025-11-18 09:00:00', NULL, 0, 0, '2025-11-18 14:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-13 15:00:00'),
(32, 13, '456 Maple Ave, Oakville', 'Basic', 3, '2025-11-30 09:00:00', 150.00, 150.00, 0, 'Regular', 'completed', 150.00, '2025-11-30 09:00:00', NULL, 1, 1, '2025-11-30 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-25 15:00:00'),
(33, 13, '456 Maple Ave, Oakville', 'Basic', 3, '2025-12-07 09:00:00', 150.00, 150.00, 0, 'Weekly', 'completed', 150.00, '2025-12-07 09:00:00', NULL, 1, 1, '2025-12-07 12:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 15:00:00'),
(34, 14, '789 Oak St, Burlington', 'Deep Clean', 4, '2025-12-01 10:00:00', 280.00, 280.00, 0, 'Monthly', 'completed', 280.00, '2025-12-01 10:00:00', NULL, 1, 1, '2025-12-01 15:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-26 14:00:00'),
(35, 15, '123', 'Deep Clean', 22, '2025-12-10 00:00:00', 22.00, 1580.00, 1, 'a', 'completed', 33.00, '2025-12-10 12:00:00', 'd', 1, 1, '2025-12-10 00:00:00', 0, NULL, '/uploads/photos-1765328887004-573750543.JPG', NULL, NULL, NULL, NULL, '2025-12-10 01:08:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clientID` (`clientID`);

--
-- Indexes for table `records`
--
ALTER TABLE `records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`);

--
-- Indexes for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clientId` (`clientId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `records`
--
ALTER TABLE `records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `service_requests`
--
ALTER TABLE `service_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `records`
--
ALTER TABLE `records`
  ADD CONSTRAINT `records_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `service_requests` (`id`);

--
-- Constraints for table `service_requests`
--
ALTER TABLE `service_requests`
  ADD CONSTRAINT `service_requests_ibfk_1` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
