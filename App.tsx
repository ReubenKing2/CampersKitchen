import React from "react";
import { StatusBar, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import SavedScreen from "./src/screens/SavedScreen";
import { COLORS } from "./src/utils/theme";
import EquipmentScreen from "./src/screens/EquipmentScreen";
import MapScreen from "./src/screens/MapScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedList" component={SavedScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Discover: { active: "🔥", inactive: "🏕️" },
  Saved: { active: "⭐", inactive: "☆" },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.forest} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: COLORS.forest,
              borderTopColor: COLORS.bark,
              borderTopWidth: 1,
              paddingBottom: 4,
              height: 60,
            },
            tabBarActiveTintColor: COLORS.ember,
            tabBarInactiveTintColor: COLORS.mist,
            tabBarIcon: ({ focused }) => {
              const icons = TAB_ICONS[route.name] ?? {
                active: "●",
                inactive: "○",
              };
              return (
                <Text style={{ fontSize: 22 }}>
                  {focused ? icons.active : icons.inactive}
                </Text>
              );
            },
            tabBarLabelStyle: { fontFamily: "Georgia", fontSize: 11 },
          })}
        >
          <Tab.Screen name="Discover" component={DiscoverStack} />
          <Tab.Screen name="Saved" component={SavedStack} />
          <Tab.Screen name="Equipment" component={EquipmentScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
