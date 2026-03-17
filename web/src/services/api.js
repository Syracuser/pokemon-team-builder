const API_BASE = "http://localhost:8000/api";

export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  return res.json();
}

export async function fetchTeam(id) {
  const res = await fetch(`${API_BASE}/teams/${id}`);
  return res.json();
}

export async function createTeam(teamName) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_name: teamName }),
  });
  return res.json();
}

export async function updateTeamName(id, teamName) {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_name: teamName }),
  });
  return res.json();
}

export async function deleteTeam(id) {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: "DELETE" });
  return res.json();
}

export async function addPokemon(teamId, pokemon) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/pokemon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pokemon),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to add Pokemon");
  }
  return res.json();
}

export async function updatePokemon(teamId, pokemonId, data) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/pokemon/${pokemonId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removePokemon(teamId, pokemonId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/pokemon/${pokemonId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchWeakness(teamId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/weakness`);
  return res.json();
}

export async function searchPokemon(query) {
  const res = await fetch(`${API_BASE}/pokemon/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchPokemonDetails(name) {
  const res = await fetch(`${API_BASE}/pokemon/${encodeURIComponent(name)}`);
  return res.json();
}

export async function searchItems(query) {
  const res = await fetch(`${API_BASE}/items/search?q=${encodeURIComponent(query)}`);
  return res.json();
}
