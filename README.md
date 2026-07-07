# Hotel Booking DBMS

## Introduction

This project is a **Three-Tier (T3) Hotel Booking** application connecting a React frontend to a MySQL database via a Python FastAPI backend. It is designed to efficiently store and retrieve hotel data, room availability, and active guest reservations securely.

---
<img width="1600" height="900" alt="Image" src="https://github.com/user-attachments/assets/6f83e7d9-c123-43bb-bc25-d8779532e2fd" />

---

## Problem Statement

**Final Lab Assignment: DBMS (2026)**

Develop a DBMS for Hotel Booking using SQL queries on a chosen platform (MySQL) with a simple frontend.

**Tables & Attributes:**

- **Hotels:** `Hotel_ID` (PK), `Hotel_Name`, `City`, `Star_Rating`
- **Rooms:** `Room_ID` (PK), `Hotel_ID` (FK), `Room_No`, `Room_Type`, `Price_Per_Night`, `Availability`
- **Reservations:** `Reservation_ID` (PK), `Room_ID` (FK), `Guest_Name`, `Check_In_Date`, `Check_Out_Date`

**What the DBMS Does:**

It is used to fetch hotel names located within a specific city, list rooms that are marked as available, and check active reservation windows using date criteria via simple queries.

---

## Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Relational Model](#relational-model)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)

---

## Entity-Relationship Diagram

<img width="1536" height="1024" alt="Image" src="https://github.com/user-attachments/assets/d1b00c5a-aea4-43d8-8337-1719aabeb5a2" />

---
## Relational Model

```
[ HOTELS Table ]                  [ ROOMS Table ]                    [ RESERVATIONS Table ]
----------------                  ---------------                    ----------------------
Hotel_ID (PK) <-------------------+ Hotel_ID (FK)                    Reservation_ID (PK)
Hotel_Name                        | Room_ID (PK) <-------------------+ Room_ID (FK)
City                              | Room_No                          | Guest_Name
Star_Rating                       | Room_Type                        | Check_In_Date
                                  | Price_Per_Night                  | Check_Out_Date
                                  | Availability                     |
```
---

## Project Structure

```
hotel-booking-dbms/
|
|-- frontend/                  # React.js UI codebase
|   |-- package.json
|   |-- src/
|
|-- backend/                   # Python FastAPI codebase
|   |-- requirements.txt       # Python dependencies
|   |-- main.py                # API endpoints and server logic
|   |-- database.py            # MySQL connection setup
|   |-- .env                   # Hidden environment variables (DO NOT COMMIT)
|   |-- .gitignore             # Git ignore rules
|
|-- database/                  # SQL files
|   |-- schema.sql             # DDL and DML queries to build the database
```

---

## Setup Instructions

Follow these steps to run the project locally on your machine.

### 1. Database Setup

1. Open **MySQL Workbench**.
2. Open the `database/schema.sql` file.
3. Execute the script to create the `HotelBookingDB` database, build the tables, and insert the mock data.

### 2. Environment Setup

1. Navigate to the `backend/` folder.
2. Create a file named exactly `.env`.
3. Add your local MySQL credentials to the `.env` file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=HotelBookingDB
```

### 3. Backend Setup (FastAPI)

1. Open a terminal in the `Backend/` folder.
2. Install the required Python packages:

```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will now be running. You can view the automatic documentation and test the endpoints at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 4. Frontend Setup (React)

1. Open a new terminal in the `frontend/` folder.
2. Install the Node modules:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```
