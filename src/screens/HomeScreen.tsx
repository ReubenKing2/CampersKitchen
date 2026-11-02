import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { COLORS, FONTS, RADIUS, SPACING, SHADOW } from "../utils/theme";
import {
  getRecipeRecommendations,
  getCurrentSeason,
  RecipeResponse,
  Recipe,
  MOCK_RESPONSE,
} from "../utils/api";
import { searchRecipes, getLocalContext } from "../utils/search";
import {
  loadEquipment,
  loadDietary,
  saveLastLocation,
  loadLastLocation,
  saveRecipe,
  unsaveRecipe,
  isRecipeSaved,
} from "../utils/storage";
import RecipeCard from "../components/RecipeCard";
import EquipmentScreen from "./EquipmentScreen";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecipeResponse | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    loadLastLocation().then((loc) => {
      if (loc) setLocation(loc);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadSettings = async () => {
        const freshEquipment = await loadEquipment();
        const freshDietary = await loadDietary();

        // Only update state if the screen is still active
        if (isActive) {
          setEquipment(freshEquipment);
          setDietary(freshDietary);
        }
      };

      loadSettings();

      // Cleanup function when screen loses focus
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleUseMockData = useCallback(async () => {
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 800)); // small delay to feel real
    setResult(MOCK_RESPONSE);
    const saved = new Set<string>();
    for (const r of MOCK_RESPONSE.recipes) {
      if (await isRecipeSaved(r.id)) saved.add(r.id);
    }
    setSavedIds(saved);
    setLoading(false);
  }, []);

  const handleDiscover = useCallback(async () => {
    if (!location.trim()) {
      Alert.alert(
        "Where are you?",
        "Please enter your location or campsite area.",
      );
      return;
    }
    if (equipment.length === 0) {
      Alert.alert(
        "No equipment set",
        "Head to the Equipment tab to tell us what you have to cook with.",
      );
      return;
    }

    setLoading(true);
    setResult(null);
    await saveLastLocation(location.trim());

    try {
      let response;

      if (useAI) {
        response = await getRecipeRecommendations({
          location: location.trim(),
          equipment,
          season: getCurrentSeason(),
          dietaryRestrictions: dietary,
        });
      } else {
        // Local path — works offline, no key needed
        const season = getCurrentSeason();
        const recipes = searchRecipes({
          location: location.trim(),
          season,
          equipment,
          dietaryRestrictions: dietary,
        });
        const localContext = getLocalContext(location.trim(), season);
        response = { recipes, localContext };
      }

      setResult(response);
      const saved = new Set<string>();
      for (const r of response.recipes) {
        if (await isRecipeSaved(r.id)) saved.add(r.id);
      }
      setSavedIds(saved);
    } catch (err: any) {
      Alert.alert(
        "Something went wrong",
        err.message ?? "Failed to get recipes. Check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [location, equipment, dietary, useAI, handleUseMockData]);

  const handleSaveToggle = useCallback(
    async (recipe: Recipe) => {
      if (savedIds.has(recipe.id)) {
        await unsaveRecipe(recipe.id);
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(recipe.id);
          return n;
        });
      } else {
        await saveRecipe(recipe);
        setSavedIds((prev) => new Set(prev).add(recipe.id));
      }
    },
    [savedIds],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}></Text>
            <Text style={styles.appName}>Camper's Kitchen</Text>
            <Text style={styles.tagline}>Cook wild. Eat well.</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📍 Where are you camping?</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Lake District, Cumbria, UK"
              placeholderTextColor={COLORS.stone}
              returnKeyType="search"
              onSubmitEditing={handleDiscover}
            />
          </View>

          {/* Equipment summary */}
          <View style={styles.equipmentRow}>
            {equipment.length === 0 ? (
              <TouchableOpacity
                onPress={() => navigation.navigate("Equipment")}
              >
                <Text style={styles.equipmentEmpty}>
                  ⚠️ No equipment set — tap to add
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <Text style={styles.sectionLabel}>🍳 Your kit</Text>
                <Text style={styles.equipmentSummary}>
                  {equipment.slice(0, 4).join(" · ")}
                  {equipment.length > 4 ? ` +${equipment.length - 4} more` : ""}
                </Text>
              </View>
            )}
          </View>

          {/* Search mode toggle */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.togglePill, !useAI && styles.togglePillActive]}
              onPress={() => setUseAI(false)}
            >
              <Text
                style={[styles.toggleText, !useAI && styles.toggleTextActive]}
              >
                Local
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.togglePill, useAI && styles.togglePillActive]}
              onPress={() => setUseAI(true)}
            >
              <Text
                style={[styles.toggleText, useAI && styles.toggleTextActive]}
              >
                AI
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main CTA */}
          <TouchableOpacity
            style={[styles.discoverBtn, loading && styles.discoverBtnDisabled]}
            onPress={handleDiscover}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.discoverBtnText}>
                Find Recipes for This Location
              </Text>
            )}
          </TouchableOpacity>

          {/*Filter Button*/}
          <TouchableOpacity
            style={[styles.filterBtn, loading && styles.filterBtn]}
            onPress={() => navigation.navigate("Equipment")}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.discoverBtnText}>Filter options</Text>
            )}
          </TouchableOpacity>

          {/* Local context */}
          {result && (
            <View style={styles.localContextCard}>
              <Text style={styles.localContextLabel}>🌿 LOCAL KNOWLEDGE</Text>
              <Text style={styles.localContextText}>{result.localContext}</Text>
            </View>
          )}

          {/* Results */}
          {result && (
            <View>
              <Text style={styles.recipesHeading}>Recipes for you</Text>
              {result.recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={(r) =>
                    navigation.navigate("RecipeDetail", { recipe: r })
                  }
                  onSave={handleSaveToggle}
                  isSaved={savedIds.has(recipe.id)}
                />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌲</Text>
              <Text style={styles.emptyText}>
                Tell us where you are and what you're cooking with — we'll find
                recipes using local, seasonal ingredients.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.forest },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  header: { alignItems: "center", paddingVertical: SPACING.lg },
  logo: { fontSize: 48, marginBottom: SPACING.xs },
  appName: {
    fontFamily: FONTS.display,
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.ash,
    letterSpacing: 0.5,
  },
  tagline: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.stone,
    marginTop: 4,
    fontStyle: "italic",
  },
  section: { marginBottom: SPACING.md },
  sectionLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ember,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.canopy,
    color: COLORS.ash,
    fontFamily: FONTS.body,
    fontSize: 15,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.moss,
  },
  equipmentRow: { marginBottom: SPACING.md },
  equipmentEmpty: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.warning,
  },
  equipmentSummary: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mist,
  },
  discoverBtn: {
    backgroundColor: COLORS.ember,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
    ...SHADOW.card,
  },
  discoverBtnDisabled: { opacity: 0.6 },
  discoverBtnText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  filterBtn: {
    backgroundColor: COLORS.ember,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    marginBottom: SPACING.sm,
    ...SHADOW.card,
  },
  primaryBtn: {
    backgroundColor: COLORS.ember,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  localContextCard: {
    backgroundColor: COLORS.bark + "55",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.flame,
  },
  localContextLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.flame,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  localContextText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mist,
    lineHeight: 19,
  },
  recipesHeading: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.ash,
    marginBottom: SPACING.md,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.stone,
    textAlign: "center",
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: COLORS.canopy,
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
    alignSelf: "center",
  },
  togglePill: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  togglePillActive: {
    backgroundColor: COLORS.ember,
  },
  toggleText: {
    color: COLORS.stone,
    fontSize: 14,
  },
  toggleTextActive: {
    color: COLORS.ash,
    fontWeight: "600",
  },
});
