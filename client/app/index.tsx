import { useEffect } from "react";
import { router } from "expo-router";
import { View } from "react-native";

export default function Home() {
  useEffect(() => {
    router.replace("/auth/login");
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#111" }} />;
}
