import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', "https://lonyqfwfjvpmsxsfcing.supabase.co")
SUPABASE_KEY = os.getenv('SUPABASE_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbnlxZndmanZwbXN4c2ZjaW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwOTU4MDIsImV4cCI6MjA1MzY3MTgwMn0.V5dPJM0WjO18STC8-3kiz57TP_O-WQbhNdT5kmATmVU")
