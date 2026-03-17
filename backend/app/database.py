from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "pokemon_team_builder"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]
teams_collection = db["teams"]
