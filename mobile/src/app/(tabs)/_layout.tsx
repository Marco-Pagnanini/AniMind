import { Tabs } from "expo-router";
import { Text } from "react-native";

const GOLD = "#E5C07B";
const MUTED = "#6A6A6A";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopColor: "#2A2A2A",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Scopri",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>◆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mylist"
        options={{
          title: "La mia lista",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>★</Text>
          ),
        }}
      />
    </Tabs>
  );
}
