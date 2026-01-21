import asyncio
from app.models.user import User
from app.models.property import Property
from sqlalchemy.orm import configure_mappers

def test_relationships():
    print("Testing SQLAlchemy relationships...")
    try:
        configure_mappers()
        print("Success! All relationships are correctly configured.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_relationships()
