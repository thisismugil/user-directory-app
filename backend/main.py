import os
import time
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, Request, Response, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from collections import defaultdict

app = FastAPI(title="LinkedIn Data Exposure Demo - Target API")

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# MongoDB Connection
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["linkedin_target"]

# Protection Configuration (in-memory, with DB backup)
PROTECTION_ENABLED = False
rate_limit_records = defaultdict(list)

# Schemas
class ProtectionToggle(BaseModel):
    enabled: bool

class UserBrief(BaseModel):
    id: str
    name: str
    company: str

class UserDetail(BaseModel):
    id: str
    name: str
    headline: str
    jobTitle: str
    company: str
    email: str
    phone: str
    location: str
    education: str
    experienceYears: int
    skills: List[str]
    profileImage: str
    createdAt: str

# Middleware for rate limiting, bot detection, and API logging
@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    global PROTECTION_ENABLED
    
    # 1. Skip middleware for CORS preflight (OPTIONS)
    if request.method == "OPTIONS":
        return await call_next(request)
        
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "").lower()
    path = request.url.path
    
    # 2. Apply Protection Rules if enabled (only on public endpoints /api/users)
    if PROTECTION_ENABLED and path.startswith("/api/users"):
        # Bot Detection: Block requests from Python libraries, curl, or empty UA
        bot_keywords = ["python", "requests", "httpx", "urllib", "scrapy", "curl", "wget"]
        if not user_agent or any(kw in user_agent for kw in bot_keywords):
            # Log the blocked request
            await db["api_logs"].insert_one({
                "path": path,
                "timestamp": datetime.now(timezone.utc),
                "client_ip": client_ip,
                "user_agent": user_agent,
                "status": 403,
                "blocked": True,
                "reason": "Bot Detection"
            })
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "Access Blocked: Automated crawler detected (Bot Detection active)."}
            )
            
        # Rate Limiting: 10 requests / 10 seconds
        now = time.time()
        # Clean older entries
        rate_limit_records[client_ip] = [t for t in rate_limit_records[client_ip] if now - t < 10]
        if len(rate_limit_records[client_ip]) >= 10:
            # Log the rate limited request
            await db["api_logs"].insert_one({
                "path": path,
                "timestamp": datetime.now(timezone.utc),
                "client_ip": client_ip,
                "user_agent": user_agent,
                "status": 429,
                "blocked": True,
                "reason": "Rate Limiting"
            })
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "429 Too Many Requests: Request limit exceeded (Rate Limiting active)."}
            )
        rate_limit_records[client_ip].append(now)

    # 3. Log normal API Request (unless it's internal check or logs itself)
    # We log /api/users endpoints
    should_log = path.startswith("/api/users")
    
    response = await call_next(request)
    
    if should_log:
        await db["api_logs"].insert_one({
            "path": path,
            "timestamp": datetime.now(timezone.utc),
            "client_ip": client_ip,
            "user_agent": user_agent,
            "status": response.status_code,
            "blocked": False
        })
        
    return response

# Startup handler to load protection state from DB
@app.on_event("startup")
async def startup_event():
    global PROTECTION_ENABLED
    config = await db["protection_config"].find_one({"key": "status"})
    if config:
        PROTECTION_ENABLED = config.get("enabled", False)
    else:
        await db["protection_config"].update_one(
            {"key": "status"},
            {"$set": {"enabled": False}},
            upsert=True
        )

# API Endpoints
@app.get("/api/users", response_model=List[UserBrief])
async def get_users():
    """Returns a list of all users with minimal public fields."""
    cursor = db["users"].find({})
    users = []
    async for doc in cursor:
        users.append(UserBrief(
            id=doc["_id"],
            name=doc["name"],
            company=doc["company"]
        ))
    return users

@app.get("/api/users/details", response_model=List[UserDetail])
async def get_users_details():
    """Returns a list of all users with full profile details."""
    cursor = db["users"].find({})
    users = []
    async for doc in cursor:
        users.append(UserDetail(
            id=doc["_id"],
            name=doc["name"],
            headline=doc["headline"],
            jobTitle=doc["jobTitle"],
            company=doc["company"],
            email=doc["email"],
            phone=doc["phone"],
            location=doc["location"],
            education=doc["education"],
            experienceYears=doc["experienceYears"],
            skills=doc["skills"],
            profileImage=doc["profileImage"],
            createdAt=doc["createdAt"]
        ))
    return users


@app.get("/api/users/{user_id}", response_model=UserDetail)
async def get_user_detail(user_id: str):
    """Returns the full profile details for a given user ID."""
    doc = await db["users"].find_one({"_id": user_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
        
    # Log the profile view
    await db["profile_views"].insert_one({
        "user_id": user_id,
        "name": doc["name"],
        "timestamp": datetime.now(timezone.utc)
    })
    
    return UserDetail(
        id=doc["_id"],
        name=doc["name"],
        headline=doc["headline"],
        jobTitle=doc["jobTitle"],
        company=doc["company"],
        email=doc["email"],
        phone=doc["phone"],
        location=doc["location"],
        education=doc["education"],
        experienceYears=doc["experienceYears"],
        skills=doc["skills"],
        profileImage=doc["profileImage"],
        createdAt=doc["createdAt"]
    )

@app.get("/api/stats")
async def get_stats():
    """Returns high level statistics about the user directory."""
    users_count = await db["users"].count_documents({})
    companies = await db["users"].distinct("company")
    locations = await db["users"].distinct("location")
    
    # Calculate unique skills
    pipeline = [
        {"$unwind": "$skills"},
        {"$group": {"_id": "$skills"}},
        {"$count": "count"}
    ]
    cursor = db["users"].aggregate(pipeline)
    skills_count_res = await cursor.to_list(1)
    skills_count = skills_count_res[0]["count"] if skills_count_res else 0

    return {
        "totalUsers": users_count,
        "totalCompanies": len(companies),
        "totalLocations": len(locations),
        "totalSkills": skills_count
    }

@app.get("/api/protection")
async def get_protection():
    """Returns the current protection setting."""
    global PROTECTION_ENABLED
    return {"protection_enabled": PROTECTION_ENABLED}

@app.post("/api/protection")
async def toggle_protection(payload: ProtectionToggle):
    """Enables or disables the scraper protection."""
    global PROTECTION_ENABLED
    PROTECTION_ENABLED = payload.enabled
    await db["protection_config"].update_one(
        {"key": "status"},
        {"$set": {"enabled": PROTECTION_ENABLED}},
        upsert=True
    )
    return {"protection_enabled": PROTECTION_ENABLED}

@app.get("/api/analytics")
async def get_analytics():
    """Returns aggregated data for the target app analytics panel."""
    # 1. Total Profile Views
    total_views = await db["profile_views"].count_documents({})
    
    # 2. Total API Requests
    total_api_requests = await db["api_logs"].count_documents({})
    
    # 3. Top Viewed Profiles
    pipeline = [
        {"$group": {"_id": "$user_id", "views": {"$sum": 1}, "name": {"$first": "$name"}}},
        {"$sort": {"views": -1}},
        {"$limit": 5}
    ]
    cursor = db["profile_views"].aggregate(pipeline)
    top_viewed = []
    async for item in cursor:
        top_viewed.append({
            "id": item["_id"],
            "name": item["name"],
            "views": item["views"]
        })
        
    # If top_viewed is empty, provide some default users for visual demonstration
    if not top_viewed:
        cursor = db["users"].find({}).limit(5)
        async for doc in cursor:
            top_viewed.append({
                "id": doc["_id"],
                "name": doc["name"],
                "views": 0
            })

    # 4. Requests per minute (last 10 minutes)
    now = datetime.now(timezone.utc)
    rpm_data = []
    for i in range(9, -1, -1):
        minute_start = now - timedelta(minutes=i+1)
        minute_end = now - timedelta(minutes=i)
        
        # count requests in this interval
        count = await db["api_logs"].count_documents({
            "timestamp": {"$gte": minute_start, "$lt": minute_end}
        })
        
        rpm_data.append({
            "time": minute_end.strftime("%H:%M"),
            "requests": count
        })
        
    return {
        "totalViews": total_views,
        "totalApiRequests": total_api_requests,
        "topViewed": top_viewed,
        "requestsPerMinute": rpm_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
