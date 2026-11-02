import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { COLORS, FONTS, SPACING, RADIUS } from "../utils/theme";
import { GOOGLE_PLACES_KEY } from "../utils/constants";
import { SafeAreaView } from "react-native-safe-area-context";

interface Shop {
  id: string;
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
  type: string;
}

const SHOP_TYPES = [
  { label: "🛒 Farm Shops", query: "farm shop" },
  { label: "🐟 Fishmonger", query: "fishmonger" },
  { label: "🥩 Butcher", query: "butcher" },
  { label: "🌿 Health Food", query: "health food store" },
  { label: "🛍️ Supermarket", query: "supermarket" },
];

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("farm shop");
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (region) fetchNearbyShops(activeFilter);
  }, [region, activeFilter]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission denied. Enable it in Settings.");
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const fetchNearbyShops = async (query: string) => {
    if (!region) return;
    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=5000&keyword=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const results: Shop[] = (data.results || []).map((p: any) => ({
        id: p.place_id,
        name: p.name,
        vicinity: p.vicinity,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        type: query,
      }));
      setShops(results);
    } catch (e) {
      setError("Could not load nearby shops.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.ember} />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter pills */}
      <FlatList
        horizontal
        data={SHOP_TYPES}
        keyExtractor={(i) => i.query}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: SPACING.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === item.query && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(item.query)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === item.query && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            coordinate={{ latitude: shop.lat, longitude: shop.lng }}
            title={shop.name}
            description={shop.vicinity}
            pinColor={COLORS.ember}
          />
        ))}
      </MapView>

      {/* Shop list */}
      <FlatList
        data={shops}
        keyExtractor={(s) => s.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Searching nearby..." : "No shops found nearby"}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.shopCard}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopAddress}>{item.vicinity}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.forest },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.forest,
  },
  loadingText: {
    color: COLORS.stone,
    marginTop: SPACING.sm,
    fontFamily: FONTS.body,
  },
  errorText: {
    color: COLORS.ember,
    fontFamily: FONTS.body,
    textAlign: "center",
    padding: SPACING.md,
  },
  filterBar: { paddingVertical: SPACING.sm, maxHeight: 56 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.canopy,
    marginRight: 8,
  },
  filterPillActive: { backgroundColor: COLORS.ember },
  filterText: { color: COLORS.stone, fontFamily: FONTS.body, fontSize: 13 },
  filterTextActive: { color: COLORS.ash, fontWeight: "600" },
  map: { flex: 1 },
  list: { maxHeight: 200, backgroundColor: COLORS.canopy },
  shopCard: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.forest,
  },
  shopName: {
    color: COLORS.ash,
    fontFamily: FONTS.body,
    fontWeight: "600",
    fontSize: 14,
  },
  shopAddress: {
    color: COLORS.stone,
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.stone,
    padding: SPACING.md,
    textAlign: "center",
    fontFamily: FONTS.body,
  },
});
