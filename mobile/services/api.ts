const API_BASE = "http://10.0.2.2:8000/api"; // Android emulator -> localhost
// For physical device, replace with your machine's local IP

export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  return res.json();
}

export async function fetchTeam(id: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`);
  return res.json();
}

export async function createTeam(teamName: string) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_name: teamName }),
  });
  return res.json();
}

export async function updateTeamName(id: string, teamName: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team_name: teamName }),
  });
  return res.json();
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: "DELETE" });
  return res.json();
}

export async function addPokemon(
  teamId: string,
  pokemon: { name: string; types: string[]; ability: string; item: string; moves: string[] }
) {
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

export async function updatePokemon(
  teamId: string,
  pokemonId: string,
  data: Record<string, any>
) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/pokemon/${pokemonId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function removePokemon(teamId: string, pokemonId: string) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/pokemon/${pokemonId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchWeakness(teamId: string) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/weakness`);
  return res.json();
}

export async function searchPokemon(query: string) {
  const res = await fetch(`${API_BASE}/pokemon/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function fetchPokemonDetails(name: string) {
  const res = await fetch(`${API_BASE}/pokemon/${encodeURIComponent(name)}`);
  return res.json();
}
