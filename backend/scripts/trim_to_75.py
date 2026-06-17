"""
trim_to_75.py
Connects to MongoDB and deletes users beyond 75, keeping the oldest 75.
"""
import os
import sys
from pymongo import MongoClient

# Load .env from backend directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                try:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")
                except ValueError:
                    pass

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("ERROR: MONGODB_URI not found in .env")
    sys.exit(1)

client = MongoClient(MONGODB_URI)
db = client["linkedin_target"]
collection = db["users"]

total = collection.count_documents({})
print(f"Current user count: {total}")

if total <= 75:
    print(f"Already at or below 75 users. No deletion needed.")
    sys.exit(0)

to_delete = total - 75
print(f"Deleting {to_delete} users (keeping oldest 75)...")

# Get the IDs of the NEWEST users (sorted by createdAt descending)
newest_ids = [
    doc["_id"]
    for doc in collection.find({}, {"_id": 1}).sort("createdAt", -1).limit(to_delete)
]

result = collection.delete_many({"_id": {"$in": newest_ids}})
print(f"Deleted {result.deleted_count} users.")
print(f"Remaining users: {collection.count_documents({})}")

client.close()
