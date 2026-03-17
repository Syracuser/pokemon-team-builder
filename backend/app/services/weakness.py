ALL_TYPES = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic",
    "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
]

# TYPE_CHART[attacking][defending] -> multiplier
# Rows = attacking type, Cols = defending type (indexed by ALL_TYPES order)
_CHART_DATA = {
    "normal":   [1,1,1,1,1,1,1,1,1,1,1,1,0.5,0,1,1,0.5,1],
    "fire":     [1,0.5,0.5,1,2,2,1,1,1,1,1,2,0.5,1,0.5,1,2,1],
    "water":    [1,2,0.5,1,0.5,1,1,1,2,1,1,1,2,1,0.5,1,1,1],
    "electric": [1,1,2,0.5,0.5,1,1,1,0,2,1,1,1,1,0.5,1,1,1],
    "grass":    [1,0.5,2,1,0.5,1,1,0.5,2,0.5,1,0.5,2,1,0.5,1,0.5,1],
    "ice":      [1,0.5,0.5,1,2,0.5,1,1,2,2,1,1,1,1,2,1,0.5,1],
    "fighting": [2,1,1,1,1,2,1,0.5,1,0.5,0.5,0.5,2,0,1,2,2,0.5],
    "poison":   [1,1,1,1,2,1,1,0.5,0.5,1,1,1,0.5,0.5,1,1,0,2],
    "ground":   [1,2,1,2,0.5,1,1,2,1,0,1,0.5,2,1,1,1,2,1],
    "flying":   [1,1,1,0.5,2,1,2,1,1,1,1,2,0.5,1,1,1,0.5,1],
    "psychic":  [1,1,1,1,1,1,2,2,1,1,0.5,1,1,1,1,0,0.5,1],
    "bug":      [1,0.5,1,1,2,1,0.5,0.5,1,0.5,2,1,1,0.5,1,2,0.5,0.5],
    "rock":     [1,2,1,1,1,2,0.5,1,0.5,2,1,2,1,1,1,1,0.5,1],
    "ghost":    [0,1,1,1,1,1,1,1,1,1,2,1,1,2,1,0.5,1,1],
    "dragon":   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,0.5,0],
    "dark":     [1,1,1,1,1,1,0.5,1,1,1,2,1,1,2,1,0.5,1,0.5],
    "steel":    [1,0.5,0.5,0.5,1,2,1,1,1,1,1,1,2,1,1,1,0.5,2],
    "fairy":    [1,0.5,1,1,1,1,2,0.5,1,1,1,1,1,1,2,2,0.5,1],
}

TYPE_CHART: dict[str, dict[str, float]] = {}
for atk, multipliers in _CHART_DATA.items():
    TYPE_CHART[atk] = {ALL_TYPES[i]: multipliers[i] for i in range(18)}


def get_defensive_multipliers(pokemon_types: list[str]) -> dict[str, float]:
    """Get defensive multiplier for each attacking type against a Pokemon."""
    result = {}
    for atk_type in ALL_TYPES:
        mult = 1.0
        for def_type in pokemon_types:
            mult *= TYPE_CHART[atk_type].get(def_type, 1.0)
        result[atk_type] = mult
    return result


def analyze_team(pokemon_list: list[dict]) -> dict:
    """Analyze team weaknesses, resistances, immunities, coverage score, and type chart grid."""
    if not pokemon_list:
        return {
            "weaknesses": [],
            "resistances": [],
            "immunities": [],
            "coverage_score": 0,
            "type_chart": {},
        }

    # Build per-pokemon defensive multipliers
    per_pokemon = []
    for pkmn in pokemon_list:
        mults = get_defensive_multipliers(pkmn.get("types", []))
        per_pokemon.append({"name": pkmn["name"], "multipliers": mults})

    # Type chart grid: attacking_type -> [mult for each pokemon]
    type_chart = {}
    for atk_type in ALL_TYPES:
        type_chart[atk_type] = [p["multipliers"][atk_type] for p in per_pokemon]

    # Analyze each attacking type across the team
    weaknesses = []
    resistances = []
    immunities = []

    score = 0.0
    for atk_type in ALL_TYPES:
        mults = type_chart[atk_type]
        best = min(mults)
        weak_count = sum(1 for m in mults if m >= 2)

        if best == 0:
            immunities.append(atk_type)
            score += 2
        elif best <= 0.5:
            resistances.append({"type": atk_type, "best_multiplier": best})
            score += 1.5
        elif best <= 1:
            score += 1
        elif best <= 2:
            weaknesses.append({"type": atk_type, "weak_count": weak_count})
            score += 0.25
        else:
            weaknesses.append({"type": atk_type, "weak_count": weak_count})
            score += 0

    coverage_score = round(score / (18 * 2) * 100)

    # Sort weaknesses by severity
    weaknesses.sort(key=lambda w: w["weak_count"], reverse=True)

    return {
        "weaknesses": weaknesses,
        "resistances": resistances,
        "immunities": immunities,
        "coverage_score": coverage_score,
        "type_chart": type_chart,
        "pokemon_names": [p["name"] for p in per_pokemon],
    }
