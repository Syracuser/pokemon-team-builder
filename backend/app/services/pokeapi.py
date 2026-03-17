import httpx

POKEAPI_BASE = "https://pokeapi.co/api/v2"

# In-memory caches (loaded once, reused)
_pokemon_cache: list[dict] | None = None
_items_cache: list[dict] | None = None


async def _get_all_pokemon() -> list[dict]:
    """Fetch and cache the full Pokemon list from PokeAPI."""
    global _pokemon_cache
    if _pokemon_cache is not None:
        return _pokemon_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{POKEAPI_BASE}/pokemon?limit=1302")
        resp.raise_for_status()
        _pokemon_cache = resp.json()["results"]
    return _pokemon_cache


async def _get_all_items() -> list[dict]:
    """Fetch and cache holdable items from PokeAPI."""
    global _items_cache
    if _items_cache is not None:
        return _items_cache
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{POKEAPI_BASE}/item?limit=2000")
        resp.raise_for_status()
        _items_cache = resp.json()["results"]
    return _items_cache


async def search_pokemon(query: str, limit: int = 10) -> list[dict]:
    """Search Pokemon by name using cached list."""
    all_pokemon = await _get_all_pokemon()
    query_lower = query.lower()
    # Prioritize starts-with matches, then contains
    starts = [p for p in all_pokemon if p["name"].startswith(query_lower)]
    contains = [p for p in all_pokemon if query_lower in p["name"] and not p["name"].startswith(query_lower)]
    matches = starts + contains
    return [{"name": p["name"]} for p in matches[:limit]]


async def search_items(query: str, limit: int = 10) -> list[dict]:
    """Search items by name using cached list."""
    all_items = await _get_all_items()
    query_lower = query.lower()
    starts = [i for i in all_items if i["name"].startswith(query_lower)]
    contains = [i for i in all_items if query_lower in i["name"] and not i["name"].startswith(query_lower)]
    matches = starts + contains
    return [{"name": i["name"]} for i in matches[:limit]]


async def get_pokemon_details(name: str) -> dict:
    """Fetch full Pokemon details from PokeAPI."""
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{POKEAPI_BASE}/pokemon/{name.lower()}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()

    types = [t["type"]["name"] for t in data["types"]]
    abilities = [a["ability"]["name"] for a in data["abilities"]]
    moves = [m["move"]["name"] for m in data["moves"]]
    sprite = data["sprites"]["front_default"]

    return {
        "name": data["name"],
        "types": types,
        "abilities": abilities,
        "moves": moves,
        "sprite": sprite,
    }
