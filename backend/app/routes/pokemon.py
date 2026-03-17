from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
import uuid
from app.database import teams_collection
from app.models import PokemonCreate, PokemonUpdate

router = APIRouter(tags=["pokemon"])

MAX_TEAM_SIZE = 6


def serialize_team(team: dict) -> dict:
    team["_id"] = str(team["_id"])
    return team


@router.post("/teams/{team_id}/pokemon", status_code=201)
async def add_pokemon(team_id: str, pokemon: PokemonCreate):
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if len(team.get("pokemon", [])) >= MAX_TEAM_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Team already has {MAX_TEAM_SIZE} Pokemon. Cannot add more.",
        )

    pokemon_doc = pokemon.model_dump()
    pokemon_doc["id"] = str(uuid.uuid4())

    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$push": {"pokemon": pokemon_doc},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )

    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    return serialize_team(team)


@router.put("/teams/{team_id}/pokemon/{pokemon_id}")
async def update_pokemon(team_id: str, pokemon_id: str, update: PokemonUpdate):
    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    pokemon_list = team.get("pokemon", [])
    pokemon_index = None
    for i, p in enumerate(pokemon_list):
        if p["id"] == pokemon_id:
            pokemon_index = i
            break

    if pokemon_index is None:
        raise HTTPException(status_code=404, detail="Pokemon not found in team")

    update_data = update.model_dump(exclude_none=True)
    set_fields = {f"pokemon.{pokemon_index}.{k}": v for k, v in update_data.items()}
    set_fields["updated_at"] = datetime.utcnow()

    await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {"$set": set_fields},
    )

    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    return serialize_team(team)


@router.delete("/teams/{team_id}/pokemon/{pokemon_id}")
async def remove_pokemon(team_id: str, pokemon_id: str):
    result = await teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$pull": {"pokemon": {"id": pokemon_id}},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")

    team = await teams_collection.find_one({"_id": ObjectId(team_id)})
    return serialize_team(team)
