import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, RADIUS, SPACING } from "../utils/theme";
import { Recipe } from "../utils/api";

export default function RecipeDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const recipe: Recipe | undefined = (route.params as any)?.recipe;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>No recipe selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.metaRow}>
          <MetaPill emoji="⏱" value={recipe.cookTime} />
          <MetaPill emoji="👥" value={`${recipe.servings} servings`} />
          <MetaPill
            emoji="📊"
            value={recipe.difficulty}
            color={
              recipe.difficulty === "Easy"
                ? COLORS.success
                : recipe.difficulty === "Medium"
                  ? COLORS.warning
                  : COLORS.ember
            }
          />
        </View>

        <Section title="🍳 Equipment needed">
          {recipe.equipment.map((e, i) => (
            <BulletItem key={i} text={e} />
          ))}
        </Section>

        <Section title="🛒 Ingredients">
          {recipe.localIngredients.length > 0 && (
            <View style={styles.ingredientGroup}>
              <Text style={styles.ingredientGroupLabel}>📍 Source locally</Text>
              {recipe.localIngredients.map((ing, i) => (
                <BulletItem key={i} text={ing} accent />
              ))}
            </View>
          )}
          {recipe.shopIngredients.length > 0 && (
            <View style={styles.ingredientGroup}>
              <Text style={styles.ingredientGroupLabel}>🏪 Bring / buy</Text>
              {recipe.shopIngredients.map((ing, i) => (
                <BulletItem key={i} text={ing} />
              ))}
            </View>
          )}
          {recipe.localIngredients.length === 0 &&
            recipe.shopIngredients.length === 0 &&
            recipe.ingredients.map((ing, i) => (
              <BulletItem key={i} text={ing} />
            ))}
        </Section>

        <Section title="👨‍🍳 Method">
          {recipe.method.map((step, i) => (
            <StepItem key={i} number={i + 1} text={step} />
          ))}
        </Section>

        {recipe.tips ? (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>💡 Campsite tip</Text>
            <Text style={styles.tipText}>{recipe.tips}</Text>
          </View>
        ) : null}

        <View style={styles.tags}>
          {recipe.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MetaPill({
  emoji,
  value,
  color = COLORS.moss,
}: {
  emoji: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={[styles.metaPill, { backgroundColor: color + "33" }]}>
      <Text style={[styles.metaPillText, { color }]}>
        {emoji} {value}
      </Text>
    </View>
  );
}

function BulletItem({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bullet, accent && styles.bulletAccent]}>
        {accent ? "◆" : "·"}
      </Text>
      <Text style={[styles.bulletText, accent && styles.bulletTextAccent]}>
        {text}
      </Text>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.forest },
  scroll: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  backBtn: { marginBottom: SPACING.md },
  backBtnText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.ember },
  name: {
    fontFamily: FONTS.display,
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.ash,
    marginBottom: SPACING.sm,
    lineHeight: 32,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.mist,
    lineHeight: 22,
    marginBottom: SPACING.md,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  metaPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  metaPillText: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: "600" },
  section: { marginBottom: SPACING.lg },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.ash,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.moss + "66",
    paddingBottom: SPACING.xs,
  },
  ingredientGroup: { marginBottom: SPACING.sm },
  ingredientGroupLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.stone,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.stone,
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  bulletAccent: { color: COLORS.ember, fontSize: 10, marginTop: 3 },
  bulletText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.mist,
    lineHeight: 20,
  },
  bulletTextAccent: { color: COLORS.ash },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.ember,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.mist,
    lineHeight: 21,
  },
  tipCard: {
    backgroundColor: COLORS.canopy,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.flame,
  },
  tipLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.flame,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tipText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.mist,
    lineHeight: 19,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.xs },
  tag: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stone },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.stone,
    textAlign: "center",
    lineHeight: 22,
  },
});
