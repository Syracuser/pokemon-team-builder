from fastapi import APIRouter, HTTPException, Query
from app.services.pokeapi import search_pokemon, get_pokemon_details, search_items

router = APIRouter(tags=["pokeapi"])


@router.get("/pokemon/search")
async def search(q: str = Query(..., min_length=1)):
    results = await search_pokemon(q)
    return results


@router.get("/pokemon/{name}")
async def get_pokemon(name: str):
    details = await get_pokemon_details(name)
    if details is None:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    return details


@router.get("/items/search")
async def search_items_endpoint(q: str = Query(..., min_length=1)):
    results = await search_items(q)
    return results
