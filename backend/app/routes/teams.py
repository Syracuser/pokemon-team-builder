from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from app.database import teams_collection
from app.models import TeamCreate, TeamUpdate

router = APIRouter(tags=["teams"])


def serialize_team(team: dict) -> dict:
    team["_id"] = str(team["_id"])
    return team


@router.post("/teams", status_code=201)
async def create_team(team: TeamCreate):
    now = datetime.utcnow()
    doc = {
        "team_name": team.team_name,
        "created_at": now,
        "updated_at": now,
        "pokemon": [],
    }
    result = await teams_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc


@router.get("/teams")
async def get_teams():
    teams = []
    async for team in teams_collection.find():
        teams.append(serialize_team(team))
    return teams


@router.get("/teams/{team_id}")
async def get_team(team_id: str):
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return serialize_team(team)


@router.put("/teams/{team_id}")
async def update_team(team_id: str, update: TeamUpdate):
    result = await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {"$set": {"team_name": update.team_name, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    return serialize_team(team)


@router.delete("/teams/{team_id}")
async def delete_team(team_id: str):
    result = await teams_collection.delete_one({"_id": ObjectId(team_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted"}
