from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.api.v1 import auth, properties, users, inquiries, analytics, admin, bookings, messaging_api
from app.core.socket_manager import sio
import socketio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Premium Real Estate Platform API",
    version=settings.API_VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

# CORS Middleware — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
)

# Trusted Host Middleware (security)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS.split(",")
    )

# Include routers
app.include_router(auth.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(properties.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(users.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(inquiries.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(analytics.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(admin.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(bookings.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(bookings.router, prefix=f"/api/{settings.API_VERSION}")
app.include_router(messaging_api.router, prefix=f"/api/{settings.API_VERSION}")

# Mount static files
import os
from fastapi.staticfiles import StaticFiles

# Create static directory if not exists
os.makedirs("static/uploads/avatars", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.API_VERSION,
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV
    }

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"Starting {settings.APP_NAME} API")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"S3 Endpoint: {settings.S3_ENDPOINT}")
    logger.info(f"S3 Public URL Override: {settings.S3_PUBLIC_URL_OVERRIDE}")
    
    # Create tables if they don't exist
    from app.database import engine, Base
    # Ensure models are imported so they are registered with Base
    from app.models.user import User
    from app.models.property import Property
    from app.models.booking import Booking
    from app.models.messaging import Conversation, Message
    from app.models.activity import Activity
    from app.models.verification_document import VerificationDocument
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Fix Enums (Ensure 'stay' and 'STAY' exist)
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            await conn.execution_options(isolation_level="AUTOCOMMIT")
            # Try both stay and STAY just in case
            for val in ["stay", "STAY"]:
                try:
                    await conn.execute(text(f"ALTER TYPE propertypurpose ADD VALUE IF NOT EXISTS '{val}'"))
                    logger.info(f"Enum value '{val}' verified in database.")
                except Exception as e:
                    # Ignore if already exists or other issues
                    logger.debug(f"Enum value {val} check: {e}")
            
            # Also check propertystatus if needed
            try:
                await conn.execute(text("ALTER TYPE propertystatus ADD VALUE IF NOT EXISTS 'published'"))
            except Exception:
                pass
                
            # Add verification_documents column to users if it doesn't exist
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'"))
                # Also ensure existing rows are initialized if they were created before the default was added
                await conn.execute(text("UPDATE users SET verification_documents = '[]' WHERE verification_documents IS NULL"))
                logger.info("Column verification_documents ensured in users table")
            except Exception as e:
                logger.debug(f"Column verification_documents check: {e}")

            # Add agent_status column to users if it doesn't exist (using the already created enum)
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS agent_status agentstatus"))
                logger.info("Column agent_status ensured in users table")
            except Exception as e:
                logger.debug(f"Column agent_status check: {e}")

            # Add rejection_reason column to users if it doesn't exist
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT"))
                logger.info("Column rejection_reason ensured in users table")
            except Exception as e:
                logger.debug(f"Column rejection_reason check: {e}")

            # Ensure Foreign Key Cascades for reliable deletion
            # Note: These may fail if constraints have different names, but we try standard ones
            constraints = [
                ("properties", "agent_id", "users"),
                ("conversations", "tenant_id", "users"),
                ("conversations", "agent_id", "users"),
                ("conversations", "property_id", "properties"),
                ("messages", "sender_id", "users"),
                ("verification_documents", "user_id", "users"),
                ("inquiries", "property_id", "properties"),
                ("inquiries", "user_id", "users"),
                ("saved_properties", "user_id", "users"),
                ("saved_properties", "property_id", "properties"),
                ("viewed_properties", "user_id", "users"),
                ("viewed_properties", "property_id", "properties"),
                ("bookings", "user_id", "users"),
                ("bookings", "property_id", "properties")
            ]
            
            for table, col, ref in constraints:
                try:
                    # Drop existing if it exists
                    constraint_name = f"{table}_{col}_fkey"
                    await conn.execute(text(f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {constraint_name}"))
                    # Add with CASCADE
                    await conn.execute(text(f"ALTER TABLE {table} ADD CONSTRAINT {constraint_name} FOREIGN KEY ({col}) REFERENCES {ref}(id) ON DELETE CASCADE"))
                    logger.info(f"Ensured CASCADE on {table}.{col}")
                except Exception as e:
                    logger.debug(f"Could not update cascade for {table}.{col}: {e}")

            logger.info("Database enums and schema verification check complete")
            
            # Inject sample stays if none exist
            from app.models.property import PropertyType, PropertyPurpose, PropertyStatus
            from app.models.user import User, UserRole, UserStatus
            import uuid
            
            from sqlalchemy.ext.asyncio import AsyncSession
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy import select
            from datetime import datetime
            from app.core.security import get_password_hash
            
            async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
            async with async_session() as session:
                # Check if any stays exist
                stmt = select(Property).where(Property.purpose == PropertyPurpose.STAY).limit(1)
                result = await session.execute(stmt)
                if not result.scalar_one_or_none():
                    logger.info("No sample stays found, injecting 5 high-quality stays...")
                    
                    # Find any admin
                    admin_stmt = select(User).where(User.role.in_(["admin", "super_admin"])).limit(1)
                    admin_result = await session.execute(admin_stmt)
                    admin = admin_result.scalar_one_or_none()
                    
                    if not admin:
                        logger.info("No admin user found, creating system admin...")
                        admin = User(
                            id=uuid.uuid4(),
                            email="admin@guri24.com",
                            name="System Admin",
                            password_hash=get_password_hash("admin123"),
                            role=UserRole.ADMIN,
                            status=UserStatus.ACTIVE,
                            email_verified=True
                        )
                        session.add(admin)
                        await session.flush()
                        
                    sample_stays = [
                        {
                            "title": "Oceanfront Infinity Villa - Malindi",
                            "description": "Experience peak luxury in this stunning oceanfront villa. Features an infinity pool, private beach access, and 24/7 butler service. Perfect for high-end retreats.",
                            "type": PropertyType.VILLA,
                            "price": 45000,
                            "location": "Malindi, Coastal",
                            "address": "Casuarina Road, Malindi, Kenya",
                            "bedrooms": 5,
                            "bathrooms": 6,
                            "area_sqft": 4500,
                            "features": {"pool": True, "beach_access": True, "wifi": True, "chef": True, "ac": True},
                            "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200", "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200"]
                        },
                        {
                            "title": "Modern Boho Loft in Kilimani",
                            "description": "A stylish, plant-filled loft in the heart of Kilimani. High ceilings, industrial windows, and a dedicated workspace. Ideal for digital nomads.",
                            "type": PropertyType.APARTMENT,
                            "price": 8500,
                            "location": "Kilimani, Nairobi",
                            "address": "Argwings Kodhek Rd, Nairobi, Kenya",
                            "bedrooms": 1,
                            "bathrooms": 1,
                            "area_sqft": 950,
                            "features": {"wifi": True, "workspace": True, "gym": True, "balcony": True},
                            "images": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200"]
                        },
                        {
                            "title": "Glass Treehouse - Karen Forest",
                            "description": "Sleep among the trees in this architectural masterpiece. Floor-to-ceiling glass walls offer breathtaking views of the forest.",
                            "type": PropertyType.HOUSE,
                            "price": 22000,
                            "location": "Karen, Nairobi",
                            "address": "Mbagathi Ridge, Nairobi, Kenya",
                            "bedrooms": 2,
                            "bathrooms": 2,
                            "area_sqft": 1800,
                            "features": {"forest_view": True, "fireplace": True, "wifi": True, "deck": True},
                            "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200", "https://images.unsplash.com/photo-1449156001533-cb39c85244f0?w=1200"]
                        },
                        {
                            "title": "Skyline Minimalist Penthouse",
                            "description": "Sleek penthouse with rooftop lounge and 360-degree views of the Nairobi skyline on the 24th floor.",
                            "type": PropertyType.APARTMENT,
                            "price": 15000,
                            "location": "Westlands, Nairobi",
                            "address": "Gochi St, Westlands, Kenya",
                            "bedrooms": 2,
                            "bathrooms": 2,
                            "area_sqft": 1600,
                            "features": {"rooftop": True, "wifi": True, "security": True, "pool": True},
                            "images": ["https://images.unsplash.com/photo-1512918766671-ad651939634b?w=1200", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"]
                        },
                        {
                            "title": "Rustic Farmhouse cottage - Naivasha",
                            "description": "Charming colonial-style farmhouse near Lake Naivasha. Perfect for weekend getaways with fresh air and roaming wildlife.",
                            "type": PropertyType.HOUSE,
                            "price": 12500,
                            "location": "Naivasha, Rift Valley",
                            "address": "Moi South Lake Rd, Naivasha, Kenya",
                            "bedrooms": 3,
                            "bathrooms": 2,
                            "area_sqft": 2400,
                            "features": {"garden": True, "fireplace": True, "wildlife": True, "kitchen": True},
                            "images": ["https://images.unsplash.com/photo-1500315331616-db4f707c24d1?w=1200", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200"]
                        }
                    ]
                    
                    for s in sample_stays:
                        new_prop = Property(
                            id=uuid.uuid4(),
                            title=s["title"],
                            slug="-".join(s["title"].lower().split()),
                            description=s["description"],
                            type=s["type"],
                            purpose=PropertyPurpose.STAY,
                            price=s["price"],
                            location=s["location"],
                            address=s["address"],
                            bedrooms=s["bedrooms"],
                            bathrooms=s["bathrooms"],
                            area_sqft=s["area_sqft"],
                            features=s["features"],
                            images=s["images"],
                            status=PropertyStatus.PUBLISHED,
                            agent_id=admin.id,
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow(),
                            published_at=datetime.utcnow()
                        )
                        session.add(new_prop)
                    
                    await session.commit()
                    logger.info("Successfully injected 5 sample stays")
                else:
                    logger.info("Sample stays already exist, skipping injection")

    except Exception as e:
        logger.error(f"Failed to verifiy enums or inject stays: {e}")

    logger.info("Database tables and sample data verified/created")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.APP_NAME} API")

# Wrap with Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:socket_app",  # Run the wrapped app
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
