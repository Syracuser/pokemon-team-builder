import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  searchPokemon,
  fetchPokemonDetails,
  addPokemon,
  fetchTeam,
  updatePokemon,
  searchItems,
} from "../services/api";

const TYPE_COLORS = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular";
const ITEM_SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/items";

function itemSlug(name) {
  return name.toLowerCase().replace(/ /g, "-");
}

export default function PokemonForm({ edit }) {
  const { teamId, pokemonId } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ability, setAbility] = useState("");
  const [item, setItem] = useState("");
  const [itemResults, setItemResults] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [moveFilter, setMoveFilter] = useState("");
  const [error, setError] = useState("");
  const searchTimer = useRef(null);
  const itemTimer = useRef(null);

  useEffect(() => {
    if (edit && pokemonId) loadExisting();
  }, [edit, pokemonId]);

  const loadExisting = async () => {
    const team = await fetchTeam(teamId);
    const p = team.pokemon?.find((pk) => pk.id === pokemonId);
    if (!p) return;
    // Fetch full details from PokeAPI to get all abilities and moves
    const details = await fetchPokemonDetails(p.name);
    if (details) {
      setSelected(details);
      setAbility(p.ability);
      setItem(p.item);
      setSelectedMoves(p.moves);
      setQuery(p.name);
    } else {
      // Fallback if PokeAPI fails
      setSelected({ name: p.name, types: p.types, abilities: [p.ability], moves: p.moves });
      setAbility(p.ability);
      setItem(p.item);
      setSelectedMoves(p.moves);
      setQuery(p.name);
    }
  };

  // Debounced Pokemon search
  const handleSearch = (text) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const data = await searchPokemon(text);
      setResults(data);
    }, 150);
  };

  // Debounced item search
  const handleItemSearch = (text) => {
    setItem(text);
    if (itemTimer.current) clearTimeout(itemTimer.current);
    if (text.length < 2) { setItemResults([]); setShowItemDropdown(false); return; }
    setShowItemDropdown(true);
    itemTimer.current = setTimeout(async () => {
      const data = await searchItems(text);
      setItemResults(data);
    }, 150);
  };

  const selectItem = (name) => {
    setItem(name);
    setItemResults([]);
    setShowItemDropdown(false);
  };

  const handleSelect = async (name) => {
    const details = await fetchPokemonDetails(name);
    setSelected(details);
    setAbility(details.abilities[0] || "");
    setSelectedMoves([]);
    setResults([]);
    setQuery(details.name);
  };

  const toggleMove = (move) => {
    if (selectedMoves.includes(move)) {
      setSelectedMoves(selectedMoves.filter((m) => m !== move));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!selected) { setError("Select a Pokemon first"); return; }
    if (selectedMoves.length === 0) { setError("Select at least 1 move"); return; }

    try {
      if (edit) {
        await updatePokemon(teamId, pokemonId, { ability, item: item || "None", moves: selectedMoves });
      } else {
        await addPokemon(teamId, {
          name: selected.name,
          types: selected.types,
          ability,
          item: item || "None",
          moves: selectedMoves,
        });
      }
      navigate(`/team/${teamId}`);
    } catch (e) {
      setError(e.message);
    }
  };

  // Filter moves by search text
  const filteredMoves = (selected?.moves || []).filter(
    (m) => !moveFilter || m.includes(moveFilter.toLowerCase())
  );

  return (
    <div>
      <Link to={`/team/${teamId}`} style={{ color: "#dc2626", textDecoration: "none" }}>
        &larr; Back to team
      </Link>
      <h2 style={{ marginTop: 12 }}>{edit ? "Edit Pokemon" : "Add Pokemon"}</h2>

      {error && <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>}

      {/* Pokemon search (add mode only) */}
      {!edit && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Pokemon..."
            style={inputStyle}
          />
          {results.length > 0 && (
            <div style={dropdownStyle}>
              {results.slice(0, 10).map((r) => (
                <div
                  key={r.name}
                  onClick={() => handleSelect(r.name)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    textTransform: "capitalize",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <img
                    src={`${SPRITE_BASE}/${r.name}.png`}
                    alt=""
                    style={{ width: 32, height: 27, imageRendering: "pixelated" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  {r.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div>
          {/* Pokemon header with sprite */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <img
              src={`${SPRITE_BASE}/${selected.name}.png`}
              alt={selected.name}
              style={{ width: 56, height: 47, imageRendering: "pixelated" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <h3 style={{ textTransform: "capitalize", margin: 0 }}>{selected.name}</h3>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {selected.types.map((t) => (
                  <span
                    key={t}
                    style={{
                      backgroundColor: TYPE_COLORS[t] || "#888",
                      color: "#fff",
                      padding: "2px 10px",
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
            </div>
          </div>

          {/* Ability */}
          <label style={labelStyle}>Ability</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {selected.abilities.map((a) => (
              <button
                key={a}
                onClick={() => setAbility(a)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: ability === a ? "2px solid #dc2626" : "2px solid transparent",
                  backgroundColor: ability === a ? "#dc2626" : "#fff",
                  color: ability === a ? "#fff" : "#333",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Held Item with autofill */}
          <label style={labelStyle}>Held Item</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item && item !== "None" && (
                <img
                  src={`${ITEM_SPRITE_BASE}/${itemSlug(item)}.png`}
                  alt=""
                  style={{ width: 24, height: 24, imageRendering: "pixelated" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              <input
                value={item}
                onChange={(e) => handleItemSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                onFocus={() => { if (itemResults.length > 0) setShowItemDropdown(true); }}
                placeholder="Search for an item..."
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            {showItemDropdown && itemResults.length > 0 && (
              <div style={dropdownStyle}>
                {itemResults.slice(0, 8).map((r) => (
                  <div
                    key={r.name}
                    onMouseDown={() => selectItem(r.name)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      textTransform: "capitalize",
                    }}
                  >
                    {r.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Moves */}
          <label style={labelStyle}>Moves ({selectedMoves.length}/4)</label>
          {/* Selected moves */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {selectedMoves.map((m) => (
              <span
                key={m}
                onClick={() => toggleMove(m)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 16,
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  boxShadow: "0 1px 3px rgba(220,38,38,0.3)",
                }}
              >
                {m} &times;
              </span>
            ))}
          </div>
          {/* Move search */}
          <input
            value={moveFilter}
            onChange={(e) => setMoveFilter(e.target.value)}
            placeholder="Filter moves..."
            style={{ ...inputStyle, marginBottom: 8 }}
          />
          {/* All available moves */}
          <div style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            maxHeight: 240,
            overflow: "auto",
            padding: 8,
            backgroundColor: "#fff",
            borderRadius: 8,
            border: "1px solid #eee",
          }}>
            {filteredMoves.length === 0 && (
              <p style={{ color: "#999", margin: 0, fontSize: 13 }}>No moves found.</p>
            )}
            {filteredMoves.map((m) => (
              <button
                key={m}
                onClick={() => toggleMove(m)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 14,
                  border: "none",
                  backgroundColor: selectedMoves.includes(m) ? "#fca5a5" : "#f3f4f6",
                  color: selectedMoves.includes(m) ? "#991b1b" : "#333",
                  cursor: selectedMoves.length >= 4 && !selectedMoves.includes(m) ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "capitalize",
                  opacity: selectedMoves.length >= 4 && !selectedMoves.includes(m) ? 0.5 : 1,
                }}
                disabled={selectedMoves.length >= 4 && !selectedMoves.includes(m)}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 24,
              padding: "12px 32px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(220,38,38,0.3)",
            }}
          >
            {edit ? "Save Changes" : "Add to Team"}
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 15,
  boxSizing: "border-box",
};

const labelStyle = {
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
  color: "#333",
};

const dropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: 8,
  maxHeight: 280,
  overflow: "auto",
  zIndex: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};
