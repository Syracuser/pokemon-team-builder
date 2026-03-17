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
import { useRouter, useFocusEffect } from "expo-router";
import { fetchTeams, deleteTeam } from "../services/api";

export default function TeamListScreen() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await fetchTeams();
      setTeams(data);
    } catch (e) {
      Alert.alert("Error", "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Team", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTeam(id);
          loadTeams();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={loadTeams}
        ListEmptyComponent={
          <Text style={styles.empty}>No teams yet. Create one!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/team/${item._id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{item.team_name}</Text>
                <Text style={styles.pokemonCount}>
                  {item.pokemon?.length || 0}/6 Pokemon
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item._id, item.team_name)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
            {item.pokemon?.length > 0 && (
              <View style={styles.spriteRow}>
                {item.pokemon.map((p: any, i: number) => (
                  <Image
                    key={i}
                    source={{ uri: `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${p.name}.png` }}
                    style={styles.miniSprite}
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/team/create")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  teamName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  pokemonCount: { fontSize: 14, color: "#666", marginTop: 4 },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 6,
  },
  deleteBtnText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
  spriteRow: { flexDirection: "row", gap: 4, marginTop: 8 },
  miniSprite: { width: 48, height: 40, resizeMode: "contain" as const },
  empty: { textAlign: "center", marginTop: 40, color: "#999", fontSize: 16 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
