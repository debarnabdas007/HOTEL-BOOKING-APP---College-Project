from fastapi import FastAPI, HTTPException
import random
from database import get_db_connection
from models import BookingRequest

app = FastAPI(title="Hotel Booking DBMS API")

# Query 1: Fetch hotel names located within a specific city
@app.get("/api/hotels/{city}")
def get_hotels_by_city(city: str):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True) # dictionary=True makes the output JSON-friendly
    
    try:
        # We use %s to safely inject the city variable into the SQL query
        query = "SELECT Hotel_Name FROM Hotels WHERE City = %s"
        cursor.execute(query, (city,))
        hotels = cursor.fetchall()
        return {"city": city, "hotels": hotels}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Always close the cursor and connection to free up memory
        cursor.close()
        db.close()


# Query 2: List rooms that are marked as available
@app.get("/api/rooms/available")
def get_available_rooms():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        query = "SELECT Room_ID, Room_No, Room_Type, Price_Per_Night FROM Rooms WHERE Availability = 1"
        cursor.execute(query)
        rooms = cursor.fetchall()
        return {"available_rooms": rooms}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        cursor.close()
        db.close()


# Query 3: Check active reservation windows using date criteria
@app.get("/api/reservations/active")
def check_active_reservations(start_date: str, end_date: str):
    # The frontend will send dates in the URL like: ?start_date=2026-07-11&end_date=2026-07-13
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        query = """
            SELECT Reservation_ID, Guest_Name, Check_In_Date, Check_Out_Date 
            FROM Reservations 
            WHERE Check_In_Date <= %s AND Check_Out_Date >= %s
        """
        cursor.execute(query, (end_date, start_date))
        reservations = cursor.fetchall()
        return {"active_reservations": reservations}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        cursor.close()
        db.close()

# Query 4: Book a room (POST Request)
@app.post("/api/reservations/book")
def book_room(booking: BookingRequest):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    try:
        # --- NEW VALIDATION STEP ---
        # First, check if the room actually exists and is available
        check_query = "SELECT Availability FROM Rooms WHERE Room_ID = %s"
        cursor.execute(check_query, (booking.Room_ID,))
        room = cursor.fetchone()
        
        # If the room doesn't exist in the database
        if not room:
            raise HTTPException(status_code=404, detail="Room not found.")
            
        # If the room's availability is already 0
        if room['Availability'] == 0:
            raise HTTPException(status_code=400, detail="Sorry, this room is already booked!")
        # ---------------------------

        # Step 1: Generate a random ID for the new reservation
        new_reservation_id = random.randint(2000, 9999)
        
        # Step 2: INSERT the new reservation into the database
        insert_query = """
            INSERT INTO Reservations (Reservation_ID, Room_ID, Guest_Name, Check_In_Date, Check_Out_Date) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (
            new_reservation_id, 
            booking.Room_ID, 
            booking.Guest_Name, 
            booking.Check_In_Date, 
            booking.Check_Out_Date
        ))
        
        # Step 3: UPDATE the room so it is no longer available
        update_query = "UPDATE Rooms SET Availability = 0 WHERE Room_ID = %s"
        cursor.execute(update_query, (booking.Room_ID,))
        
        # Step 4: COMMIT the transaction! 
        db.commit()
        
        return {
            "message": "Booking successful!", 
            "Reservation_ID": new_reservation_id
        }
        
    except HTTPException:
        # If we raised an HTTP exception intentionally, just pass it through
        raise
    except Exception as e:
        # If a database error fails, rollback the changes
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        cursor.close()
        db.close()