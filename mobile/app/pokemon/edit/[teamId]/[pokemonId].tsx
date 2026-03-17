import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchTeam, updatePokemon, fetchPokemonDetails, searchItems } from "../../../../services/api";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular";
const ITEM_SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

export default function EditPokemonScreen() {
  const { teamId, pokemonId } = useLocalSearchParams<{
    teamId: string;
    pokemonId: string;
  }>();
  const router = useRouter();

  const [pokemon, setPokemon] = useState<any>(null);
  const [allAbilities, setAllAbilities] = useState<string[]>([]);
  const [allMoves, setAllMoves] = useState<string[]>([]);
  const [ability, setAbility] = useState("");
  const [item, setItem] = useState("");
  const [itemResults, setItemResults] = useState<any[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [moveFilter, setMoveFilter] = useState("");
  const itemTimer = useRef<any>(null);

  useEffect(() => {
    loadPokemon();
  }, []);

  const loadPokemon = async () => {
    try {
      const team = await fetchTeam(teamId);
      const found = team.pokemon?.find((p: any) => p.id === pokemonId);
      if (!found) return;

      setPokemon(found);
      setAbility(found.ability);
      setItem(found.item);
      setSelectedMoves(found.moves);

      const details = await fetchPokemonDetails(found.name);
      if (details) {
        setAllAbilities(details.abilities || []);
        setAllMoves(details.moves || []);
      } else {
        setAllAbilities([found.ability]);
        setAllMoves(found.moves);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load Pokemon");
    }
  };

  const handleItemSearch = (text: string) => {
    setItem(text);
    if (itemTimer.current) clearTimeout(itemTimer.current);
    if (text.length < 2) {
      setItemResults([]);
      setShowItemDropdown(false);
      return;
    }
    setShowItemDropdown(true);
    itemTimer.current = setTimeout(async () => {
      const data = await searchItems(text);
      setItemResults(data);
    }, 150);
  };

  const selectItem = (name: string) => {
    setItem(name);
    setItemResults([]);
    setShowItemDropdown(false);
  };

  const toggleMove = (move: string) => {
    if (selectedMoves.includes(move)) {
      setSelectedMoves(selectedMoves.filter((m) => m !== move));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const handleSave = async () => {
    if (selectedMoves.length === 0) {
      Alert.alert("Error", "Select at least 1 move");
      return;
    }
    try {
      await updatePokemon(teamId, pokemonId, {
        ability,
        item: item || "None",
        moves: selectedMoves,
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to update Pokemon");
    }
  };

  const filteredMoves = allMoves.filter(
    (m) => !moveFilter || m.includes(moveFilter.toLowerCase())
  );

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: `${SPRITE_BASE}/${pokemon.name}.png` }}
            style={styles.sprite}
          />
          <View>
            <Text style={styles.name}>{pokemon.name}</Text>
            <View style={styles.typesRow}>
              {pokemon.types.map((t: string) => (
                <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] || "#888" }]}>
                  <Text style={styles.typeText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Ability selection */}
        <Text style={styles.label}>Ability</Text>
        <View style={styles.chipsRow}>
          {allAbilities.map((a) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAbility(a)}
              style={[
                styles.abilityChip,
                ability === a ? styles.abilityChipActive : styles.abilityChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.abilityChipText,
                  { color: ability === a ? "#fff" : "#333" },
                ]}
              >
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Held Item with autofill */}
        <Text style={styles.label}>Held Item</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          {item && item !== "None" && (
            <Image
              source={{ uri: `${ITEM_SPRITE_BASE}/${item.toLowerCase().replace(/ /g, "-")}.png` }}
              style={{ width: 28, height: 28, marginRight: 8 }}
            />
          )}
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={item}
            onChangeText={handleItemSearch}
            placeholder="Search for an item..."
            onFocus={() => { if (itemResults.length > 0) setShowItemDropdown(true); }}
          />
        </View>
        {showItemDropdown && itemResults.length > 0 && (
          <View style={styles.dropdown}>
            {itemResults.slice(0, 8).map((r: any) => (
              <TouchableOpacity
                key={r.name}
                onPress={() => selectItem(r.name)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Moves */}
        <Text style={styles.label}>Moves ({selectedMoves.length}/4)</Text>
        {/* Selected moves */}
        <View style={styles.chipsRow}>
          {selectedMoves.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => toggleMove(m)}
              style={styles.moveChipSelected}
            >
              <Text style={styles.moveChipSelectedText}>{m} ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Move filter */}
        <TextInput
          style={[styles.input, { marginBottom: 8 }]}
          value={moveFilter}
          onChangeText={setMoveFilter}
          placeholder="Filter moves..."
        />

        {/* Available moves - expands to fit all moves, page scrolls */}
        <View style={styles.movesContainer}>
          {filteredMoves.length === 0 && (
            <Text style={{ color: "#999", fontSize: 13 }}>No moves found.</Text>
          )}
          {filteredMoves.map((m) => {
            const isSelected = selectedMoves.includes(m);
            const isDisabled = selectedMoves.length >= 4 && !isSelected;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => !isDisabled && toggleMove(m)}
                style={[
                  styles.moveChip,
                  isSelected && styles.moveChipHighlight,
                  isDisabled && { opacity: 0.4 },
                ]}
              >
                <Text
                  style={[
                    styles.moveChipText,
                    isSelected && { color: "#991b1b" },
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Save button at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  sprite: { width: 56, height: 46 },
  name: { fontSize: 24, fontWeight: "bold", textTransform: "capitalize", color: "#333" },
  typesRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  abilityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  abilityChipActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  abilityChipInactive: {
    backgroundColor: "#fff",
    borderColor: "transparent",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  abilityChipText: { fontWeight: "600", fontSize: 13, textTransform: "capitalize" },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: { textTransform: "capitalize", fontSize: 15 },
  moveChipSelected: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#dc2626",
  },
  moveChipSelectedText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  movesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  moveChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  moveChipHighlight: {
    backgroundColor: "#fca5a5",
  },
  moveChipText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
    color: "#333",
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  button: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
