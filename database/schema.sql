-- Create and select the database
DROP DATABASE IF EXISTS HotelBookingDB;
CREATE DATABASE IF NOT EXISTS HotelBookingDB;
USE HotelBookingDB;

-- 1. Create the Hotels Table (Parent)
CREATE TABLE Hotels (
    Hotel_ID INT PRIMARY KEY,
    Hotel_Name VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Star_Rating INT CHECK (Star_Rating BETWEEN 1 AND 5)
);

-- 2. Create the Rooms Table (Child of Hotels)
CREATE TABLE Rooms (
    Room_ID INT PRIMARY KEY,
    Hotel_ID INT,
    Room_No VARCHAR(10) NOT NULL,
    Room_Type VARCHAR(50),
    Price_Per_Night DECIMAL(10, 2),
    Availability BOOLEAN DEFAULT 1, -- 1 means TRUE (Available), 0 means FALSE
    FOREIGN KEY (Hotel_ID) REFERENCES Hotels(Hotel_ID) ON DELETE CASCADE
);

-- 3. Create the Reservations Table (Child of Rooms)
CREATE TABLE Reservations (
    Reservation_ID INT PRIMARY KEY,
    Room_ID INT,
    Guest_Name VARCHAR(255) NOT NULL,
    Check_In_Date DATE,
    Check_Out_Date DATE,
    FOREIGN KEY (Room_ID) REFERENCES Rooms(Room_ID) ON DELETE CASCADE
);



-- Insert mock Hotels
INSERT INTO Hotels (Hotel_ID, Hotel_Name, City, Star_Rating) VALUES 
(1, 'Grand Palace', 'Kolkata', 5),
(2, 'Sea View Inn', 'Mumbai', 3),
(3, 'City Center Suites', 'Kolkata', 4),
(4, 'The Taj Mahal Palace', 'Mumbai', 5),
(5, 'ITC Sonar', 'Kolkata', 5),
(6, 'Bangalore Boutique', 'Bangalore', 4),
(7, 'Delhi Transit Hotel', 'Delhi', 2),
(8, 'Marina Beach Resort', 'Chennai', 4);

-- Insert mock Rooms
-- (Note: Rooms that are currently booked have Availability = 0)
INSERT INTO Rooms (Room_ID, Hotel_ID, Room_No, Room_Type, Price_Per_Night, Availability) VALUES 
(101, 1, '10A', 'Deluxe', 5000.00, 1),
(102, 1, '10B', 'Suite', 8000.00, 0),
(103, 2, '201', 'Standard', 2000.00, 1),
(104, 3, '1A', 'Deluxe', 4500.00, 1),
(105, 1, '10C', 'Standard', 3500.00, 1),
(106, 4, '501', 'Presidential', 25000.00, 0),
(107, 4, '502', 'Deluxe', 12000.00, 1),
(108, 5, '301', 'Suite', 15000.00, 0),
(109, 5, '302', 'Deluxe', 9000.00, 1),
(110, 6, '101', 'Standard', 3000.00, 0),
(111, 7, 'G1', 'Economy', 1200.00, 1),
(112, 8, '205', 'Sea View', 6000.00, 0),
(113, 3, '1B', 'Standard', 3000.00, 1),
(114, 2, '202', 'Deluxe', 3500.00, 1);

-- Insert mock Reservations
-- (Dates are spread across July 2026 to test overlapping date logic)
INSERT INTO Reservations (Reservation_ID, Room_ID, Guest_Name, Check_In_Date, Check_Out_Date) VALUES 
(1001, 102, 'Rahul Sharma', '2026-07-10', '2026-07-15'),
(1002, 104, 'Amit Patel', '2026-07-12', '2026-07-14'),
(1003, 106, 'Priya Singh', '2026-07-01', '2026-07-05'),
(1004, 108, 'Vikram Malhotra', '2026-07-15', '2026-07-20'),
(1005, 110, 'Sneha Iyer', '2026-07-04', '2026-07-06'),
(1006, 112, 'Arjun Nair', '2026-07-11', '2026-07-16'),
(1007, 102, 'Rohan Das', '2026-07-20', '2026-07-25'),
(1008, 104, 'Neha Gupta', '2026-07-15', '2026-07-18');