import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchWeakness } from "../services/api";
import TypeChart from "./TypeChart";

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

export default function WeaknessChart() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchWeakness(id).then(setData);
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <Link to={`/team/${id}`} style={{ color: "#dc2626" }}>&larr; Back to team</Link>
      <h2>{data.team_name} — Weakness Analysis</h2>

      {/* Coverage Score */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          marginBottom: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ color: "#666", fontSize: 14 }}>Team Defense Score</div>
        <div style={{ fontSize: 56, fontWeight: "bold", color: "#dc2626" }}>
          {data.coverage_score}%
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Weaknesses */}
        <div>
          <h3>Weaknesses</h3>
          {data.weaknesses.length === 0 && <p style={{ color: "#999" }}>None!</p>}
          {data.weaknesses.map((w) => (
            <div key={w.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  backgroundColor: TYPE_COLORS[w.type] || "#888",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {w.type}
              </span>
              <span style={{ color: "#dc2626", fontWeight: 600, fontSize: 13 }}>
                {w.weak_count} weak
              </span>
            </div>
          ))}
        </div>

        {/* Resistances */}
        <div>
          <h3>Resistances</h3>
          {data.resistances.length === 0 && <p style={{ color: "#999" }}>None</p>}
          {data.resistances.map((r) => (
            <div key={r.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  backgroundColor: TYPE_COLORS[r.type] || "#888",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {r.type}
              </span>
              <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>
                {r.best_multiplier}x
              </span>
            </div>
          ))}
        </div>

        {/* Immunities */}
        <div>
          <h3>Immunities</h3>
          {data.immunities.length === 0 && <p style={{ color: "#999" }}>None</p>}
          {data.immunities.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-block",
                backgroundColor: TYPE_COLORS[t] || "#888",
                color: "#fff",
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
                marginRight: 6,
                marginBottom: 6,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Type Chart */}
      {data.pokemon_names?.length > 0 && data.type_chart && (
        <TypeChart typeChart={data.type_chart} pokemonNames={data.pokemon_names} />
      )}
    </div>
  );
}
