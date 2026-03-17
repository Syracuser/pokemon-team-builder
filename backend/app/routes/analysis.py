from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import teams_collection
from app.services.weakness import analyze_team

router = APIRouter(tags=["analysis"])


@router.get("/teams/{team_id}/weakness")
async def get_weakness_analysis(team_id: str):
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    result = analyze_team(team.get("pokemon", []))
    result["team_name"] = team["team_name"]
    return result
