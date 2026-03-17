import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { fetchTeam, removePokemon, updateTeamName } from "../../services/api";

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
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
      {editing ? (
        <View style={styles.renameRow}>
          <TextInput
            style={styles.renameInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
          />
          <TouchableOpacity
            style={styles.renameSave}
            onPress={async () => {
              if (!editName.trim()) return;
              await updateTeamName(id, editName.trim());
              setEditing(false);
              loadTeam();
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.renameCancel}
            onPress={() => setEditing(false)}
          >
            <Text style={{ color: "#333", fontWeight: "bold" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.renameRow}>
          <Text style={styles.title}>{team.team_name}</Text>
          <TouchableOpacity
            style={styles.renameBtn}
            onPress={() => { setEditName(team.team_name); setEditing(true); }}
          >
            <Text style={{ color: "#2563eb", fontWeight: "600", fontSize: 13 }}>Rename</Text>
          </TouchableOpacity>
        </View>
      )}
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
              <View style={styles.nameRow}>
                <Image
                  source={{ uri: `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${item.name}.png` }}
                  style={styles.pokemonSprite}
                />
                <Text style={styles.pokemonName}>{item.name}</Text>
              </View>
              <View style={styles.typesRow}>
                {item.types.map((t: string) => (
                  <View key={t} style={[styles.typeBadge, { backgroundColor: typeColor(t) }]}>
                    <Text style={styles.typeText}>{t}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.detail}>Ability: {item.ability}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={styles.detail}>Item: </Text>
                {item.item && item.item !== "None" && (
                  <Image
                    source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.item.toLowerCase().replace(/ /g, "-")}.png` }}
                    style={{ width: 24, height: 24, marginRight: 4 }}
                  />
                )}
                <Text style={styles.detail}>{item.item}</Text>
              </View>
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
  nameRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginBottom: 4 },
  pokemonSprite: { width: 56, height: 46 },
  pokemonName: { fontSize: 18, fontWeight: "bold", color: "#333", textTransform: "capitalize" },
  typesRow: { flexDirection: "row", gap: 6, marginTop: 4, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  detail: { fontSize: 13, color: "#555", marginTop: 2, textTransform: "capitalize" },
  renameRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  renameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  renameSave: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#16a34a",
    borderRadius: 6,
  },
  renameCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 6,
  },
  renameBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 6,
  },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 10, marginBottom: 24 },
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
