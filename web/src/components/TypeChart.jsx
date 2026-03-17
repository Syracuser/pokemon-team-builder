const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

function multColor(mult) {
  if (mult === 0) return "#666";
  if (mult <= 0.25) return "#2d8a4e";
  if (mult <= 0.5) return "#4ade80";
  if (mult === 1) return "#e5e5e5";
  if (mult === 2) return "#dc2626";
  return "#991b1b";
}

function multLabel(mult) {
  if (mult === 0) return "0";
  if (mult === 0.25) return "\u00bc";
  if (mult === 0.5) return "\u00bd";
  if (mult === 1) return "1";
  if (mult === 2) return "2x";
  if (mult === 4) return "4x";
  return String(mult);
}

export default function TypeChart({ typeChart, pokemonNames }) {
  return (
    <div>
      <h3>Type Chart</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 2, minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ minWidth: 80, textAlign: "left", padding: "4px 8px", fontSize: 12, color: "#666" }}>
                Type
              </th>
              {pokemonNames.map((name, i) => (
                <th
                  key={i}
                  style={{
                    minWidth: 90,
                    padding: "6px 8px",
                    color: "#333",
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: "capitalize",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(typeChart).map(([atkType, mults]) => (
              <tr key={atkType}>
                <td
                  style={{
                    backgroundColor: TYPE_COLORS[atkType] || "#888",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {atkType}
                </td>
                {mults.map((m, i) => (
                  <td
                    key={i}
                    style={{
                      backgroundColor: multColor(m),
                      color: m === 1 ? "#999" : "#fff",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontWeight: "bold",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {multLabel(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
