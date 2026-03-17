import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchWeakness } from "../../../services/api";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
  grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
  ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
  steel: "#B8B8D0", fairy: "#EE99AC",
};

function multColor(mult: number): string {
  if (mult === 0) return "#666";
  if (mult <= 0.25) return "#2d8a4e";
  if (mult <= 0.5) return "#4ade80";
  if (mult === 1) return "#e5e5e5";
  if (mult === 2) return "#dc2626";
  return "#991b1b";
}

function multLabel(mult: number): string {
  if (mult === 0) return "0";
  if (mult === 0.25) return "\u00bc";
  if (mult === 0.5) return "\u00bd";
  if (mult === 1) return "1";
  if (mult === 2) return "2x";
  if (mult === 4) return "4x";
  return String(mult);
}

export default function WeaknessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const result = await fetchWeakness(id);
      setData(result);
    } catch (e) {
      Alert.alert("Error", "Failed to load analysis");
    }
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const pokemonNames: string[] = data.pokemon_names || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.teamName}>{data.team_name}</Text>

      {/* Coverage Score */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Team Defense Score</Text>
        <Text style={styles.scoreValue}>{data.coverage_score}%</Text>
      </View>

      {/* Weaknesses */}
      {data.weaknesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weaknesses</Text>
          {data.weaknesses.map((w: any) => (
            <View key={w.type} style={styles.typeRow}>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[w.type] || "#888" }]}>
                <Text style={styles.typeText}>{w.type}</Text>
              </View>
              <Text style={styles.weakCount}>
                {w.weak_count} Pokemon weak
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Resistances */}
      {data.resistances.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resistances</Text>
          {data.resistances.map((r: any) => (
            <View key={r.type} style={styles.typeRow}>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[r.type] || "#888" }]}>
                <Text style={styles.typeText}>{r.type}</Text>
              </View>
              <Text style={styles.resistText}>{r.best_multiplier}x</Text>
            </View>
          ))}
        </View>
      )}

      {/* Immunities */}
      {data.immunities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Immunities</Text>
          <View style={styles.chipsRow}>
            {data.immunities.map((t: string) => (
              <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] || "#888" }]}>
                <Text style={styles.typeText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Visual Type Chart */}
      {pokemonNames.length > 0 && data.type_chart && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type Chart</Text>
          <ScrollView horizontal>
            <View>
              {/* Header row */}
              <View style={styles.chartRow}>
                <View style={styles.chartLabelCell} />
                {pokemonNames.map((name: string, i: number) => (
                  <View key={i} style={styles.chartHeaderCell}>
                    <Text style={styles.chartHeaderText} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Data rows */}
              {Object.entries(data.type_chart).map(
                ([atkType, mults]: [string, any]) => (
                  <View key={atkType} style={styles.chartRow}>
                    <View style={[styles.chartLabelCell, { backgroundColor: TYPE_COLORS[atkType] }]}>
                      <Text style={styles.chartLabelText}>{atkType}</Text>
                    </View>
                    {mults.map((m: number, i: number) => (
                      <View
                        key={i}
                        style={[styles.chartCell, { backgroundColor: multColor(m) }]}
                      >
                        <Text style={styles.chartCellText}>{multLabel(m)}</Text>
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  teamName: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 12 },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  scoreLabel: { fontSize: 14, color: "#666" },
  scoreValue: { fontSize: 48, fontWeight: "bold", color: "#dc2626" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  typeRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  typeText: { color: "#fff", fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  weakCount: { marginLeft: 10, color: "#dc2626", fontWeight: "600" },
  resistText: { marginLeft: 10, color: "#16a34a", fontWeight: "600" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  // Type chart grid
  chartRow: { flexDirection: "row" },
  chartLabelCell: {
    width: 72,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    margin: 1,
  },
  chartLabelText: { color: "#fff", fontSize: 10, fontWeight: "bold", textTransform: "capitalize" },
  chartHeaderCell: {
    width: 72,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    margin: 1,
  },
  chartHeaderText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize", color: "#333" },
  chartCell: {
    width: 72,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    margin: 1,
  },
  chartCellText: { fontSize: 12, fontWeight: "bold", color: "#fff" },
});
