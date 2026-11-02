import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS, RADIUS, SPACING, SHADOW} from '../utils/theme';
import {Recipe} from '../utils/api';

interface Props {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

const DIFFICULTY_COLOR = {
  Easy: COLORS.success,
  Medium: COLORS.warning,
  Hard: COLORS.ember,
};

export default function RecipeCard({recipe, onPress, onSave, isSaved}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{recipe.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
        </View>
        {onSave && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => onSave(recipe)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.saveStar}>{isSaved ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.meta}>
        <Pill label={recipe.difficulty} color={DIFFICULTY_COLOR[recipe.difficulty]} />
        <Pill label={`⏱ ${recipe.cookTime}`} color={COLORS.moss} />
        <Pill label={`👥 Serves ${recipe.servings}`} color={COLORS.moss} />
      </View>

      {recipe.localIngredients.length > 0 && (
        <View style={styles.localBox}>
          <Text style={styles.localLabel}>📍 Source locally</Text>
          <Text style={styles.localText}>
            {recipe.localIngredients.slice(0, 3).join(' · ')}
            {recipe.localIngredients.length > 3 ? ' · …' : ''}
          </Text>
        </View>
      )}

      <View style={styles.tags}>
        {recipe.tags.slice(0, 4).map(tag => (
          <Text key={tag} style={styles.tag}>#{tag}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function Pill({label, color}: {label: string; color: string}) {
  return (
    <View style={[styles.pill, {backgroundColor: color + '33'}]}>
      <Text style={[styles.pillText, {color}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.canopy,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.moss + '66',
    ...SHADOW.card,
  },
  header: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm},
  titleBlock: {flex: 1, marginRight: SPACING.sm},
  name: {fontFamily: FONTS.display, fontSize: 18, fontWeight: '700', color: COLORS.ash, marginBottom: 4},
  description: {fontFamily: FONTS.body, fontSize: 13, color: COLORS.mist, lineHeight: 18},
  saveBtn: {paddingTop: 2},
  saveStar: {fontSize: 22},
  meta: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm},
  pill: {borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3},
  pillText: {fontFamily: FONTS.mono, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4},
  localBox: {
    backgroundColor: COLORS.forest, borderRadius: RADIUS.md, padding: SPACING.sm,
    marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.ember,
  },
  localLabel: {fontFamily: FONTS.mono, fontSize: 10, color: COLORS.ember, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3},
  localText: {fontFamily: FONTS.body, fontSize: 13, color: COLORS.mist},
  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs},
  tag: {fontFamily: FONTS.mono, fontSize: 11, color: COLORS.stone},
});
