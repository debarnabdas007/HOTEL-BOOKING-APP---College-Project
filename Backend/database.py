import os
import mysql.connector
from dotenv from load_dotenv

load_dotenv()

def get_db_connection():
    # This function creates and returns a connection to MySQL database
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")     # The database we created in Workbench
    )
    return connection