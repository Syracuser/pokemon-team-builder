import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTeams, deleteTeam } from "../services/api";

const SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setTeams(await fetchTeams());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteTeam(id);
    load();
  };

  return (
    <div>
      {/* Hero section */}
      <div style={{
        textAlign: "center",
        padding: "32px 0 24px",
        borderBottom: "2px solid #eee",
        marginBottom: 24,
      }}>
        <h1 style={{ fontSize: 28, margin: 0, color: "#333" }}>Welcome, Trainer!</h1>
        <p style={{ color: "#666", margin: "8px 0 20px", fontSize: 16 }}>
          Build your team, analyze weaknesses, and become a champion.
        </p>
        <Link
          to="/create-team"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            backgroundColor: "#dc2626",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
            transition: "transform 0.1s",
          }}
        >
          + Create New Team
        </Link>
      </div>

      {/* Teams list */}
      <h2 style={{ fontSize: 20, color: "#333", marginBottom: 12 }}>
        Your Teams {teams.length > 0 && <span style={{ color: "#999", fontWeight: 400 }}>({teams.length})</span>}
      </h2>

      {loading && <p style={{ color: "#999" }}>Loading...</p>}
      {!loading && teams.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: 40,
          backgroundColor: "#fff",
          borderRadius: 12,
          color: "#999",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <p style={{ fontSize: 18, margin: 0 }}>No teams yet.</p>
          <p style={{ margin: "8px 0 0" }}>Create your first team to get started!</p>
        </div>
      )}

      {teams.map((t) => (
        <Link
          key={t._id}
          to={`/team/${t._id}`}
          style={{
            display: "block",
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 10,
            textDecoration: "none",
            color: "#333",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.15s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 18 }}>{t.team_name}</strong>
              <span style={{ marginLeft: 12, color: "#666", fontSize: 14 }}>
                {t.pokemon?.length || 0}/6 Pokemon
              </span>
              {/* Mini sprite row */}
              {t.pokemon?.length > 0 && (
                <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
                  {t.pokemon.map((p, i) => (
                    <img
                      key={i}
                      src={`${SPRITE_BASE}/${p.name}.png`}
                      alt={p.name}
                      style={{ width: 60, height: 50, imageRendering: "pixelated" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={(e) => handleDelete(e, t._id, t.team_name)}
              style={{
                padding: "6px 14px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Delete
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
