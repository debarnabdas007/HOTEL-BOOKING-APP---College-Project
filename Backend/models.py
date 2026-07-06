## Any Pydantic Validation 

from pydantic import BaseModel

# This defines the exact JSON structure expected for a POST request
class BookingRequest(BaseModel):
    Room_ID: int
    Guest_Name: str
    Check_In_Date: str
    Check_Out_Date: str