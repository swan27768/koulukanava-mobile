import { View, Text, Button } from "react-native";

export function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Olet kirjautunut 🎉</Text>
      <Button title="Kirjaudu ulos" onPress={() => {}} />
    </View>
  );
}
