import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { createTeam } from "../../services/api";

export default function CreateTeamScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }
    try {
      await createTeam(name.trim());
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to create team");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Team Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter team name"
        autoFocus
      />
      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Team</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
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
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
