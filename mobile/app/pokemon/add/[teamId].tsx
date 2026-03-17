import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  searchPokemon,
  fetchPokemonDetails,
  addPokemon,
} from "../../../services/api";

export default function AddPokemonScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [selectedAbility, setSelectedAbility] = useState("");
  const [item, setItem] = useState("");

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

  const toggleMove = (move: string) => {
    if (selectedMoves.includes(move)) {
      setSelectedMoves(selectedMoves.filter((m) => m !== move));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    } else {
      Alert.alert("Max 4 moves", "Remove a move first");
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

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.types}>
            Types: {selected.types.join(", ")}
          </Text>

          <Text style={styles.label}>Ability</Text>
          <View style={styles.chipsRow}>
            {selected.abilities.map((a: string) => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.chip,
                  selectedAbility === a && styles.chipSelected,
                ]}
                onPress={() => setSelectedAbility(a)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedAbility === a && styles.chipTextSelected,
                  ]}
                >
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Held Item</Text>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={setItem}
            placeholder="e.g. Life Orb"
          />

          <Text style={styles.label}>
            Moves ({selectedMoves.length}/4)
          </Text>
          <View style={styles.chipsRow}>
            {selectedMoves.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, styles.chipSelected]}
                onPress={() => toggleMove(m)}
              >
                <Text style={styles.chipTextSelected}>{m} x</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.movesList}>
            {selected.moves.slice(0, 50).map((m: string) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.moveItem,
                  selectedMoves.includes(m) && styles.moveItemSelected,
                ]}
                onPress={() => toggleMove(m)}
              >
                <Text style={styles.moveText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to Team</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
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
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  dropdownText: { fontSize: 16, textTransform: "capitalize" },
  detailSection: { marginTop: 16 },
  selectedName: { fontSize: 22, fontWeight: "bold", textTransform: "capitalize", color: "#333" },
  types: { fontSize: 14, color: "#666", marginBottom: 8, textTransform: "capitalize" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e5e5e5",
  },
  chipSelected: { backgroundColor: "#dc2626" },
  chipText: { fontSize: 13, color: "#333", textTransform: "capitalize" },
  chipTextSelected: { fontSize: 13, color: "#fff", textTransform: "capitalize" },
  movesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    maxHeight: 200,
  },
  moveItem: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  moveItemSelected: { backgroundColor: "#fca5a5" },
  moveText: { fontSize: 12, textTransform: "capitalize" },
  addButton: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
