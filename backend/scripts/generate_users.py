import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from faker import Faker
from datetime import datetime, timezone
import random

# Initialize Faker
fake = Faker()

# Load environment variables from .env file if present
if os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                try:
                    key, val = line.strip().split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")
                except ValueError:
                    pass

# MongoDB URI setup
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://mugil1206:mugilan@cluster0.zhm3u.mongodb.net/")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["linkedin_target"]
collection = db["users"]

async def generate_users():
    # Check if we already have 100 users to prevent duplicates
    count = await collection.count_documents({})
    if count >= 100:
        print(f"Database already populated with {count} users. Seeding skipped.")
        return

    print("Seeding database with 100 users...")
    
    # We want exactly 100 users
    users = []
    
    # Pre-defined professional skills to make them look realistic
    skills_pool = [
        "Python", "JavaScript", "TypeScript", "React", "Next.js", "FastAPI", 
        "MongoDB", "PostgreSQL", "Docker", "AWS", "Kubernetes", "Machine Learning", 
        "Data Analysis", "Project Management", "Cybersecurity", "UI/UX Design", 
        "Product Management", "Product Marketing", "DevOps", "GraphQL", "Node.js",
        "Golang", "Java", "C++", "Agile", "Scrum", "Git", "Rust", "TensorFlow", "PyTorch"
    ]
    
    # Pre-defined companies to look realistic
    companies = [
        "Google", "Microsoft", "Meta", "Amazon", "Apple", "Netflix", "Salesforce", 
        "Stripe", "Airbnb", "Uber", "Spotify", "Shopify", "LinkedIn", "Twitter", 
        "Oracle", "Intel", "NVIDIA", "Adobe", "Figma", "Slack"
    ]

    for i in range(1, 101):
        gender = random.choice(["men", "women"])
        img_id = random.randint(1, 99)
        profile_img = f"https://randomuser.me/api/portraits/{gender}/{img_id}.jpg"
        
        name = fake.name()
        company = random.choice(companies)
        job_title = fake.job()
        
        # A realistic headline
        headline = f"{job_title} at {company} | Passionate about building scalable systems"
        
        user_skills = random.sample(skills_pool, k=random.randint(4, 8))
        
        user_doc = {
            "_id": f"user_{i:03d}", # Generate predictable IDs (user_001, user_002, etc.) for demonstration purposes
            "name": name,
            "headline": headline,
            "jobTitle": job_title,
            "company": company,
            "email": fake.unique.email(),
            "phone": fake.phone_number(),
            "location": f"{fake.city()}, {fake.country()}",
            "education": f"B.S. in Computer Science, University of {fake.city()}",
            "experienceYears": random.randint(1, 20),
            "skills": user_skills,
            "profileImage": profile_img,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        users.append(user_doc)
        
    await collection.insert_many(users)
    print("Database seeding completed successfully. Added 100 users.")

if __name__ == "__main__":
    asyncio.run(generate_users())
