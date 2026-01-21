import asyncio
import uuid
import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import engine, Base
from app.models.property import Property, PropertyType, PropertyPurpose, PropertyStatus
from app.models.user import User, UserRole, UserStatus, AgentStatus
from app.core.security import get_password_hash

# Expanded list of countries and cities
locations = [
    {"city": "Nairobi", "country": "Kenya", "coords": (-1.2921, 36.8219)},
    {"city": "Mombasa", "country": "Kenya", "coords": (-4.0435, 39.6682)},
    {"city": "Kisumu", "country": "Kenya", "coords": (-0.0917, 34.7680)},
    {"city": "Mogadishu", "country": "Somalia", "coords": (2.0469, 45.3182)},
    {"city": "Hargeisa", "country": "Somalia", "coords": (9.5624, 44.0670)},
    {"city": "Bosaso", "country": "Somalia", "coords": (11.2842, 49.1816)},
    {"city": "Addis Ababa", "country": "Ethiopia", "coords": (9.0300, 38.7400)},
    {"city": "Dire Dawa", "country": "Ethiopia", "coords": (9.6000, 41.8667)},
    {"city": "Jijiga", "country": "Ethiopia", "coords": (9.3500, 42.8000)},
    {"city": "Djibouti City", "country": "Djibouti", "coords": (11.5890, 43.1450)},
    {"city": "Kampala", "country": "Uganda", "coords": (0.3476, 32.5825)},
    {"city": "Dar es Salaam", "country": "Tanzania", "coords": (-6.7924, 39.2083)},
]

property_titles = {
    "stay": [
        "Cozy {type} in {city}",
        "Modern {type} near City Center",
        "Spacious Family {type}",
        "Luxury {type} with Great View",
        "Charming {type} in Serene {city}",
        "Beautiful {type} for Short Stays"
    ],
    "sale": [
        "Premium {type} for Sale in {city}",
        "Affordable {type} for Investment",
        "Luxury {type} in Prime Location",
        "Spacious {type} for Sale"
    ],
    "rent": [
        "Long-term {type} for Rent",
        "Professional {type} Rental",
        "Family {type} Available for Rent"
    ],
    "shop": [
        "Commercial Shop in {city}",
        "Retail Space in Prime Location",
        "Modern Shop for Business",
        "Strategic Shop Location in {city}"
    ]
}

mock_images = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"
]

features_pool = [
    "Swimming Pool", "High-Speed Internet", "24/7 Security", "Parking", 
    "Gym Access", "Balcony", "Garden", "Elevator", "Backup Generator", 
    "Borehole", "Air Conditioning", "CCTV"
]

async def seed():
    async with AsyncSession(engine) as session:
        print("Seeding database with diverse properties including 10 short-term stays...")
        
        # 1. Ensure Agent Exists
        result = await session.execute(select(User).where(User.email == "support@guri24.com"))
        agent = result.scalar_one_or_none()
        
        if not agent:
            print("Creating agent user...")
            agent = User(
                email="support@guri24.com",
                name="Guri24 Team",
                role=UserRole.AGENT,
                password_hash=get_password_hash("agent123"),
                status=UserStatus.ACTIVE,
                agent_status=AgentStatus.VERIFIED,
                email_verified=True
            )
            session.add(agent)
            await session.commit()
            await session.refresh(agent)
        
        properties_to_create = []
        
        # 2. Create 10 Short-Term Stays (STAY purpose)
        print("Creating 10 short-term stay properties...")
        for i in range(10):
            loc = random.choice(locations)
            p_type = random.choice([PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.VILLA])
            
            title = random.choice(property_titles["stay"]).format(type=p_type.value.capitalize(), city=loc["city"])
            slug = f"{title.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
            
            # Nightly rate for stays
            price = random.randint(50, 500)
            
            selected_features = random.sample(features_pool, k=random.randint(4, 8))
            features_dict = {f"feature_{idx}": f for idx, f in enumerate(selected_features)}
            
            prop = Property(
                title=title,
                slug=slug,
                description=f"Perfect for short-term stays! This beautiful {p_type.value} is located in the heart of {loc['city']}, {loc['country']}. Ideal for travelers and vacationers. Features include {', '.join(selected_features)}.",
                type=p_type,
                purpose=PropertyPurpose.STAY,
                price=price,
                location=f"{loc['city']}, {loc['country']}",
                address=f"{random.randint(1, 100)} {loc['city']} St",
                latitude=loc["coords"][0] + (random.uniform(-0.01, 0.01)),
                longitude=loc["coords"][1] + (random.uniform(-0.01, 0.01)),
                bedrooms=random.randint(1, 4),
                bathrooms=random.randint(1, 3),
                area_sqft=random.randint(600, 2500),
                features=features_dict,
                images=random.sample(mock_images, k=3),
                status=PropertyStatus.PUBLISHED,
                agent_id=agent.id,
                published_at=datetime.utcnow()
            )
            properties_to_create.append(prop)
        
        # 3. Create 5 Shops
        print("Creating 5 shop properties...")
        for i in range(5):
            loc = random.choice(locations)
            
            title = random.choice(property_titles["shop"]).format(city=loc["city"])
            slug = f"{title.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
            
            # Shop prices for sale or rent
            purpose = random.choice([PropertyPurpose.SALE, PropertyPurpose.RENT])
            if purpose == PropertyPurpose.SALE:
                price = random.randint(100000, 2000000)
            else:
                price = random.randint(5000, 50000)
            
            selected_features = random.sample(["Prime Location", "High Foot Traffic", "Parking", "Security", "Display Windows"], k=random.randint(2, 4))
            features_dict = {f"feature_{idx}": f for idx, f in enumerate(selected_features)}
            
            prop = Property(
                title=title,
                slug=slug,
                description=f"Excellent commercial shop space in {loc['city']}, {loc['country']}. Perfect for retail business. Features: {', '.join(selected_features)}.",
                type=PropertyType.SHOP,
                purpose=purpose,
                price=price,
                location=f"{loc['city']}, {loc['country']}",
                address=f"{random.randint(1, 100)} Commercial St, {loc['city']}",
                latitude=loc["coords"][0] + (random.uniform(-0.01, 0.01)),
                longitude=loc["coords"][1] + (random.uniform(-0.01, 0.01)),
                bedrooms=0,
                bathrooms=random.randint(1, 2),
                area_sqft=random.randint(500, 3000),
                features=features_dict,
                images=random.sample(mock_images, k=2),
                status=PropertyStatus.PUBLISHED,
                agent_id=agent.id,
                published_at=datetime.utcnow()
            )
            properties_to_create.append(prop)
        
        # 4. Create 15 Mixed Properties (Sale/Rent)
        print("Creating 15 mixed properties for sale and rent...")
        for i in range(15):
            loc = random.choice(locations)
            p_type = random.choice(list(PropertyType))
            purpose = random.choice([PropertyPurpose.SALE, PropertyPurpose.RENT])
            
            # Get appropriate title template
            if purpose == PropertyPurpose.SALE:
                title = random.choice(property_titles["sale"]).format(type=p_type.value.capitalize(), city=loc["city"])
            else:
                title = random.choice(property_titles["rent"]).format(type=p_type.value.capitalize(), city=loc["city"])
            
            slug = f"{title.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
            
            # Price based on purpose
            if purpose == PropertyPurpose.SALE:
                price = random.randint(50000, 5000000)
            else:
                price = random.randint(1500, 30000)
            
            selected_features = random.sample(features_pool, k=random.randint(3, 6))
            features_dict = {f"feature_{idx}": f for idx, f in enumerate(selected_features)}
            
            # Determine bedrooms/bathrooms based on type
            if p_type in [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.VILLA]:
                bedrooms = random.randint(1, 5)
                bathrooms = random.randint(1, 3)
            elif p_type == PropertyType.SHOP:
                bedrooms = 0
                bathrooms = random.randint(1, 2)
            else:
                bedrooms = 0
                bathrooms = 0
            
            prop = Property(
                title=title,
                slug=slug,
                description=f"This is a beautiful {p_type.value} located in {loc['city']}, {loc['country']}. Features include {', '.join(selected_features)}.",
                type=p_type,
                purpose=purpose,
                price=price,
                location=f"{loc['city']}, {loc['country']}",
                address=f"{random.randint(1, 100)} {loc['city']} St",
                latitude=loc["coords"][0] + (random.uniform(-0.01, 0.01)),
                longitude=loc["coords"][1] + (random.uniform(-0.01, 0.01)),
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                area_sqft=random.randint(500, 5000),
                features=features_dict,
                images=random.sample(mock_images, k=2),
                status=PropertyStatus.PUBLISHED,
                agent_id=agent.id,
                published_at=datetime.utcnow()
            )
            properties_to_create.append(prop)
        
        # Add all properties to session
        for prop in properties_to_create:
            session.add(prop)
        
        await session.commit()
        
        print(f"\n✅ Seeding complete!")
        print(f"   - 10 Short-term Stays (STAY)")
        print(f"   - 5 Shops")
        print(f"   - 15 Mixed Properties (Sale/Rent)")
        print(f"   Total: 30 properties created!")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(seed())
