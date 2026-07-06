from fastapi import FastAPI, HTTPException
from database import get_db_connection

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