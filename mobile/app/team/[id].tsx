import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { fetchTeam, removePokemon } from "../../services/api";

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const router = useRouter();

  const loadTeam = async () => {
    try {
      const data = await fetchTeam(id);
      setTeam(data);
    } catch (e) {
      Alert.alert("Error", "Failed to load team");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTeam();
    }, [id])
  );

  const handleRemove = (pokemonId: string, name: string) => {
    Alert.alert("Remove Pokemon", `Remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removePokemon(id, pokemonId);
          loadTeam();
        },
      },
    ]);
  };

  if (!team) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{team.team_name}</Text>
      <Text style={styles.subtitle}>
        {team.pokemon?.length || 0}/6 Pokemon
      </Text>

      <FlatList
        data={team.pokemon || []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No Pokemon yet. Add some!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pokemonCard}
            onPress={() =>
              router.push(`/pokemon/edit/${id}/${item.id}`)
            }
            onLongPress={() => handleRemove(item.id, item.name)}
          >
            <View style={styles.pokemonInfo}>
              <Text style={styles.pokemonName}>{item.name}</Text>
              <View style={styles.typesRow}>
                {item.types.map((t: string) => (
                  <View key={t} style={[styles.typeBadge, { backgroundColor: typeColor(t) }]}>
                    <Text style={styles.typeText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.detail}>Ability: {item.ability}</Text>
              <Text style={styles.detail}>Item: {item.item}</Text>
              <Text style={styles.detail}>
                Moves: {item.moves.join(", ")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.buttonRow}>
        {(team.pokemon?.length || 0) < 6 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push(`/pokemon/add/${id}`)}
          >
            <Text style={styles.buttonText}>+ Add Pokemon</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.analysisButton}
          onPress={() => router.push(`/team/weakness/${id}`)}
        >
          <Text style={styles.buttonText}>Weakness Analysis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function typeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
    grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
    ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
    rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
    steel: "#B8B8D0", fairy: "#EE99AC",
  };
  return colors[type] || "#888";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 30, color: "#999" },
  pokemonCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pokemonInfo: { flex: 1 },
  pokemonName: { fontSize: 18, fontWeight: "bold", color: "#333", textTransform: "capitalize" },
  typesRow: { flexDirection: "row", gap: 6, marginTop: 4, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  detail: { fontSize: 13, color: "#555", marginTop: 2, textTransform: "capitalize" },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  addButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  analysisButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
