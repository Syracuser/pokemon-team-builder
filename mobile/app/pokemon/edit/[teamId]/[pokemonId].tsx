import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchTeam, updatePokemon } from "../../../../services/api";

export default function EditPokemonScreen() {
  const { teamId, pokemonId } = useLocalSearchParams<{
    teamId: string;
    pokemonId: string;
  }>();
  const router = useRouter();

  const [pokemon, setPokemon] = useState<any>(null);
  const [ability, setAbility] = useState("");
  const [item, setItem] = useState("");
  const [moves, setMoves] = useState("");

  useEffect(() => {
    loadPokemon();
  }, []);

  const loadPokemon = async () => {
    try {
      const team = await fetchTeam(teamId);
      const found = team.pokemon?.find((p: any) => p.id === pokemonId);
      if (found) {
        setPokemon(found);
        setAbility(found.ability);
        setItem(found.item);
        setMoves(found.moves.join(", "));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load Pokemon");
    }
  };

  const handleSave = async () => {
    const moveList = moves
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (moveList.length === 0 || moveList.length > 4) {
      Alert.alert("Error", "Enter 1-4 moves separated by commas");
      return;
    }
    try {
      await updatePokemon(teamId, pokemonId, {
        ability,
        item,
        moves: moveList,
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to update Pokemon");
    }
  };

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{pokemon.name}</Text>
      <Text style={styles.types}>Types: {pokemon.types.join(", ")}</Text>

      <Text style={styles.label}>Ability</Text>
      <TextInput
        style={styles.input}
        value={ability}
        onChangeText={setAbility}
      />

      <Text style={styles.label}>Held Item</Text>
      <TextInput style={styles.input} value={item} onChangeText={setItem} />

      <Text style={styles.label}>Moves (comma separated)</Text>
      <TextInput style={styles.input} value={moves} onChangeText={setMoves} />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  name: { fontSize: 24, fontWeight: "bold", textTransform: "capitalize", color: "#333" },
  types: { fontSize: 14, color: "#666", marginBottom: 16, textTransform: "capitalize" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
