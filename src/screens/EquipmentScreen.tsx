import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, RADIUS, SPACING, SHADOW } from "../utils/theme";
import {
  saveEquipment,
  loadEquipment,
  saveDietary,
  loadDietary,
} from "../utils/storage";

const EQUIPMENT_PRESETS = [
  { label: "Camp stove (single burner)", emoji: "🔵" },
  { label: "Camp stove (two burner)", emoji: "🟠" },
  { label: "Cast iron skillet", emoji: "🍳" },
  { label: "Pot / saucepan", emoji: "🥘" },
  { label: "Dutch oven", emoji: "🫕" },
  { label: "Grill / BBQ", emoji: "🔥" },
  { label: "Open campfire", emoji: "🪵" },
  { label: "Griddle pan", emoji: "▬" },
  { label: "Camping kettle", emoji: "☕" },
  { label: "Wok", emoji: "🥄" },
  { label: "Foil / embers cooking", emoji: "🌽" },
  { label: "No cooking equipment", emoji: "🥗" },
];

const DIETARY_OPTIONS = [
  { label: "Vegetarian", emoji: "🥦" },
  { label: "Vegan", emoji: "🌱" },
  { label: "Gluten-free", emoji: "🌾" },
  { label: "Dairy-free", emoji: "🥛" },
  { label: "Nut-free", emoji: "🥜" },
  { label: "Halal", emoji: "☪️" },
  { label: "Pescatarian", emoji: "🐟" },
];

const NUMBER_PEOPLE = [
  { label: "1" },
  { label: "2" },
  { label: "3" },
  { label: "4" },
  { label: "5" },
  { label: "6+" },
];

export default function EquipmentScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dietary, setDietary] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [people, setPeople] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const eq = await loadEquipment();
      const presetLabels = EQUIPMENT_PRESETS.map((e) => e.label);
      setSelected(new Set(eq.filter((e) => presetLabels.includes(e))));
      setCustomItems(eq.filter((e) => !presetLabels.includes(e)));
      setDietary(new Set(await loadDietary()));
    })();
  }, []);

  const toggleEquipment = useCallback((label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    setSaved(false);
  }, []);

  const toggleDietary = useCallback((label: string) => {
    setDietary((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    setSaved(false);
  }, []);

  const togglePeople = useCallback((label: string) => {
    setPeople((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
    setSaved(false);
  }, []);

  const addCustom = useCallback(() => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    if (customItems.includes(trimmed)) {
      Alert.alert("Already added", `${trimmed} is already in your kit.`);
      return;
    }
    setCustomItems((prev) => [...prev, trimmed]);
    setCustom("");
    setSaved(false);
  }, [custom, customItems]);

  const handleSave = useCallback(async () => {
    await saveEquipment([...selected, ...customItems]);
    await saveDietary([...dietary]);
    setSaved(true);
  }, [selected, customItems, dietary]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Your Kitchen Kit</Text>
        <Text style={styles.subheading}>
          Tell us what you're cooking with — we'll only suggest recipes you can
          actually make.
        </Text>

        <Text style={styles.sectionLabel}>
          🧑 How many people are you cooking for?
        </Text>
        <View style={styles.grid}>
          {NUMBER_PEOPLE.map(({ label }) => {
            const active = people.has(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => togglePeople(label)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>⚙️ Cooking Equipment</Text>
        <View style={styles.grid}>
          {EQUIPMENT_PRESETS.map(({ label, emoji }) => {
            const active = selected.has(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleEquipment(label)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>➕ Add custom equipment</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={custom}
            onChangeText={setCustom}
            placeholder="e.g. Trangia, Kelly Kettle…"
            placeholderTextColor={COLORS.stone}
            onSubmitEditing={addCustom}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCustom}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {customItems.map((item) => (
          <View key={item} style={styles.customRow}>
            <Text style={styles.customItem}>🔧 {item}</Text>
            <TouchableOpacity
              onPress={() => {
                setCustomItems((prev) => prev.filter((i) => i !== item));
                setSaved(false);
              }}
            >
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionLabel}>🥗 Dietary requirements</Text>
        <View style={styles.grid}>
          {DIETARY_OPTIONS.map(({ label, emoji }) => {
            const active = dietary.has(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, active && styles.chipDietaryActive]}
                onPress={() => toggleDietary(label)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{emoji}</Text>
                <Text
                  style={[styles.chipLabel, active && styles.chipLabelActive]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnSaved]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {saved ? "✓ Saved!" : "Save My Kit"}
          </Text>
        </TouchableOpacity>

        {(selected.size > 0 || customItems.length > 0) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>YOUR CURRENT KIT</Text>
            <Text style={styles.summaryText}>
              {[...selected, ...customItems].join(" · ")}
            </Text>
            {dietary.size > 0 && (
              <>
                <Text style={[styles.summaryLabel, { marginTop: SPACING.sm }]}>
                  DIETARY
                </Text>
                <Text style={styles.summaryText}>
                  {[...dietary].join(" · ")}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.forest },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  heading: {
    fontFamily: FONTS.display,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.ash,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.stone,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.ember,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.canopy,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.moss + "66",
    alignItems: "center",
    minWidth: 90,
    maxWidth: 140,
  },
  chipActive: {
    backgroundColor: COLORS.ember + "22",
    borderColor: COLORS.ember,
  },
  chipDietaryActive: {
    backgroundColor: COLORS.success + "22",
    borderColor: COLORS.success,
  },
  chipEmoji: { fontSize: 18, marginBottom: 2 },
  chipLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.mist,
    textAlign: "center",
  },
  chipLabelActive: { color: COLORS.ash, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
  input: {
    flex: 1,
    backgroundColor: COLORS.canopy,
    color: COLORS.ash,
    fontFamily: FONTS.body,
    fontSize: 14,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.moss,
  },
  addBtn: {
    backgroundColor: COLORS.moss,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  addBtnText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.canopy,
  },
  customItem: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.mist },
  removeBtn: {
    fontSize: 16,
    color: COLORS.stone,
    paddingHorizontal: SPACING.sm,
  },
  saveBtn: {
    backgroundColor: COLORS.ember,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
    ...SHADOW.card,
  },
  saveBtnSaved: { backgroundColor: COLORS.success },
  saveBtnText: {
    fontFamily: FONTS.display,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  summaryCard: {
    backgroundColor: COLORS.canopy,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ember,
  },
  summaryLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.stone,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mist,
    lineHeight: 19,
  },
});
