import { useState, useRef } from "react";
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
import {
  searchPokemon,
  fetchPokemonDetails,
  addPokemon,
  searchItems,
} from "../../../services/api";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

const SPRITE_BASE = "https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular";
const ITEM_SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

export default function AddPokemonScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [moveFilter, setMoveFilter] = useState("");
  const [selectedAbility, setSelectedAbility] = useState("");
  const [item, setItem] = useState("");
  const [itemResults, setItemResults] = useState<any[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const itemTimer = useRef<any>(null);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    try {
      const data = await searchPokemon(text);
      setResults(data);
    } catch (e) {
      // ignore
    }
  };

  const handleSelect = async (name: string) => {
    try {
      const details = await fetchPokemonDetails(name);
      setSelected(details);
      setSelectedAbility(details.abilities[0] || "");
      setSelectedMoves([]);
      setResults([]);
      setQuery(details.name);
    } catch (e) {
      Alert.alert("Error", "Failed to fetch Pokemon details");
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

  const handleAdd = async () => {
    if (!selected) {
      Alert.alert("Error", "Select a Pokemon first");
      return;
    }
    if (selectedMoves.length === 0) {
      Alert.alert("Error", "Select at least 1 move");
      return;
    }
    if (!selectedAbility) {
      Alert.alert("Error", "Select an ability");
      return;
    }
    try {
      await addPokemon(teamId, {
        name: selected.name,
        types: selected.types,
        ability: selectedAbility,
        item: item || "None",
        moves: selectedMoves,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add Pokemon");
    }
  };

  const filteredMoves = (selected?.moves || []).filter(
    (m: string) => !moveFilter || m.includes(moveFilter.toLowerCase())
  );

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Search Pokemon</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder="Type a Pokemon name..."
        />

        {results.length > 0 && (
          <View style={styles.dropdown}>
            {results.slice(0, 8).map((r) => (
              <TouchableOpacity
                key={r.name}
                style={styles.dropdownItem}
                onPress={() => handleSelect(r.name)}
              >
                <Text style={styles.dropdownText}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selected && (
          <View style={styles.detailSection}>
            {/* Header with sprite */}
            <View style={styles.headerRow}>
              <Image
                source={{ uri: `${SPRITE_BASE}/${selected.name}.png` }}
                style={styles.sprite}
              />
              <View>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <View style={styles.typesRow}>
                  {selected.types.map((t: string) => (
                    <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] || "#888" }]}>
                      <Text style={styles.typeText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Ability */}
            <Text style={styles.label}>Ability</Text>
            <View style={styles.chipsRow}>
              {selected.abilities.map((a: string) => (
                <TouchableOpacity
                  key={a}
                  style={[
                    styles.abilityChip,
                    selectedAbility === a ? styles.abilityChipActive : styles.abilityChipInactive,
                  ]}
                  onPress={() => setSelectedAbility(a)}
                >
                  <Text
                    style={[
                      styles.abilityChipText,
                      { color: selectedAbility === a ? "#fff" : "#333" },
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
              style={[styles.input, { marginTop: 8, marginBottom: 8 }]}
              value={moveFilter}
              onChangeText={setMoveFilter}
              placeholder="Filter moves..."
            />

            {/* Available moves - expands to fit all */}
            <View style={styles.movesContainer}>
              {filteredMoves.length === 0 && (
                <Text style={{ color: "#999", fontSize: 13 }}>No moves found.</Text>
              )}
              {filteredMoves.map((m: string) => {
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
          </View>
        )}
      </ScrollView>

      {/* Fixed button at bottom */}
      {selected && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to Team</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dropdownText: { fontSize: 16, textTransform: "capitalize" },
  detailSection: { marginTop: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  sprite: { width: 56, height: 46 },
  selectedName: { fontSize: 22, fontWeight: "bold", textTransform: "capitalize", color: "#333" },
  typesRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
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
  addButton: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
