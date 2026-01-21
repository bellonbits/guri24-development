import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def migrate():
    # Credentials from .env
    url = "postgresql+asyncpg://admin:12345678@35.192.97.98:5432/guri24"
    engine = create_async_engine(url)
    try:
        async with engine.begin() as conn:
            print("Connected to remote DB: 35.192.97.98")
            
            print("Ensuring 'agent_status' column exists...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_status VARCHAR(50) DEFAULT 'unverified'"))
            
            print("Ensuring 'verification_documents' column exists...")
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'"))
            
            print("Initializing NULL values...")
            await conn.execute(text("UPDATE users SET agent_status = 'unverified' WHERE agent_status IS NULL"))
            await conn.execute(text("UPDATE users SET verification_documents = '[]' WHERE verification_documents IS NULL"))
            
            print("Migration successful!")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
