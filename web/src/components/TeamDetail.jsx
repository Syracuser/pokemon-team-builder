import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTeam, removePokemon } from "../services/api";

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular";
const ITEM_SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

function itemSlug(name) {
  return name.toLowerCase().replace(/ /g, "-");
}

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);

  const load = async () => setTeam(await fetchTeam(id));
  useEffect(() => { load(); }, [id]);

  const handleRemove = async (pokemonId, name) => {
    if (!confirm(`Remove ${name}?`)) return;
    await removePokemon(id, pokemonId);
    load();
  };

  if (!team) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/" style={{ color: "#dc2626", textDecoration: "none" }}>&larr; Back to teams</Link>
      <h2 style={{ marginTop: 12 }}>{team.team_name}</h2>
      <p style={{ color: "#666" }}>{team.pokemon?.length || 0}/6 Pokemon</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(team.pokemon?.length || 0) < 6 && (
          <Link to={`/team/${id}/add-pokemon`} style={btnRed}>
            + Add Pokemon
          </Link>
        )}
        <Link to={`/team/${id}/weakness`} style={btnBlue}>
          Weakness Analysis
        </Link>
      </div>

      {team.pokemon?.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, backgroundColor: "#fff", borderRadius: 12, color: "#999" }}>
          No Pokemon yet. Add some!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {team.pokemon?.map((p) => (
          <div
            key={p.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              border: "1px solid #f0f0f0",
            }}
          >
            {/* Header: name + sprite */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <img
                src={`${SPRITE_BASE}/${p.name}.png`}
                alt={p.name}
                style={{ width: 68, height: 56, imageRendering: "pixelated" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <strong style={{ fontSize: 18, textTransform: "capitalize", flex: 1 }}>{p.name}</strong>
            </div>

            {/* Type badges */}
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {p.types.map((t) => (
                <span
                  key={t}
                  style={{
                    backgroundColor: TYPE_COLORS[t] || "#888",
                    color: "#fff",
                    padding: "3px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Details */}
            <p style={detailStyle}>
              <span style={{ color: "#999" }}>Ability:</span>{" "}
              <span style={{ textTransform: "capitalize" }}>{p.ability}</span>
            </p>
            <p style={detailStyle}>
              <span style={{ color: "#999" }}>Item:</span>{" "}
              {p.item && p.item !== "None" && (
                <img
                  src={`${ITEM_SPRITE_BASE}/${itemSlug(p.item)}.png`}
                  alt=""
                  style={{ width: 32, height: 32, verticalAlign: "middle", marginRight: 4, imageRendering: "pixelated" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              <span style={{ textTransform: "capitalize" }}>{p.item}</span>
            </p>
            <p style={detailStyle}>
              <span style={{ color: "#999" }}>Moves:</span>{" "}
              <span style={{ textTransform: "capitalize" }}>{p.moves.join(", ")}</span>
            </p>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Link
                to={`/team/${id}/edit-pokemon/${p.id}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "7px 0",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Edit
              </Link>
              <button
                onClick={() => handleRemove(p.id, p.name)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnRed = {
  display: "inline-block",
  padding: "10px 20px",
  backgroundColor: "#dc2626",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "bold",
  boxShadow: "0 2px 6px rgba(220,38,38,0.25)",
};

const btnBlue = {
  display: "inline-block",
  padding: "10px 20px",
  backgroundColor: "#2563eb",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "bold",
  boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
};

const detailStyle = {
  margin: "4px 0",
  fontSize: 13,
  color: "#555",
};
