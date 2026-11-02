import React, {useState, useCallback} from 'react';
import {View, Text, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {COLORS, FONTS, SPACING} from '../utils/theme';
import {loadSavedRecipes, unsaveRecipe} from '../utils/storage';
import {Recipe} from '../utils/api';
import RecipeCard from '../components/RecipeCard';

export default function SavedScreen() {
  const navigation = useNavigation<any>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRecipes(await loadSavedRecipes());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleUnsave = useCallback(async (recipe: Recipe) => {
    await unsaveRecipe(recipe.id);
    setRecipes(prev => prev.filter(r => r.id !== recipe.id));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.ember} />}>
        <Text style={styles.heading}>Saved Recipes</Text>
        <Text style={styles.subheading}>Your favourite campsite meals, ready to cook.</Text>
        {recipes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyText}>No saved recipes yet.{'\n'}Star a recipe on the Discover tab to save it here.</Text>
          </View>
        ) : (
          recipes.map(recipe => (
            <RecipeCard
              key={recipe.id} recipe={recipe}
              onPress={r => navigation.navigate('RecipeDetail', {recipe: r})}
              onSave={handleUnsave} isSaved={true}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.forest},
  scroll: {flex: 1},
  content: {padding: SPACING.md, paddingBottom: 60},
  heading: {fontFamily: FONTS.display, fontSize: 24, fontWeight: '700', color: COLORS.ash, marginBottom: SPACING.xs},
  subheading: {fontFamily: FONTS.body, fontSize: 14, color: COLORS.stone, lineHeight: 20, marginBottom: SPACING.lg},
  empty: {alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl},
  emptyEmoji: {fontSize: 56, marginBottom: SPACING.md},
  emptyText: {fontFamily: FONTS.body, fontSize: 15, color: COLORS.stone, textAlign: 'center', lineHeight: 22},
});
