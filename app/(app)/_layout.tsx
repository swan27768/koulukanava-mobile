import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/auth/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
