import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTeam } from "../services/api";

export default function CreateTeam() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter a team name.");
      return;
    }
    try {
      const team = await createTeam(name.trim());
      navigate(`/team/${team._id}`);
    } catch (e) {
      setError("Failed to create team.");
    }
  };

  return (
    <div>
      <Link to="/" style={{ color: "#dc2626", textDecoration: "none" }}>&larr; Back to teams</Link>
      <h2 style={{ marginTop: 16 }}>Create New Team</h2>

      {error && <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Team Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a team name..."
          autoFocus
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 16,
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 32px",
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
