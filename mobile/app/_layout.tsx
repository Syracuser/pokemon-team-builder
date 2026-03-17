import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#dc2626" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Teams" }} />
      <Stack.Screen name="team/create" options={{ title: "Create Team" }} />
      <Stack.Screen name="team/[id]" options={{ title: "Team Details" }} />
      <Stack.Screen name="team/weakness/[id]" options={{ title: "Weakness Analysis" }} />
      <Stack.Screen name="pokemon/add/[teamId]" options={{ title: "Add Pokemon" }} />
      <Stack.Screen name="pokemon/edit/[teamId]/[pokemonId]" options={{ title: "Edit Pokemon" }} />
    </Stack>
  );
}
