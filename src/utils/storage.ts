import AsyncStorage from '@react-native-async-storage/async-storage';
import {Recipe} from './api';

const KEYS = {
  API_KEY: '@ck:api_key',
  EQUIPMENT: '@ck:equipment',
  SAVED_RECIPES: '@ck:saved_recipes',
  DIETARY: '@ck:dietary',
  LAST_LOCATION: '@ck:last_location',
};

export async function clearApiKey() {
  await AsyncStorage.removeItem(KEYS.API_KEY);
}

export async function saveEquipment(equipment: string[]) {
  await AsyncStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(equipment));
}
export async function loadEquipment(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.EQUIPMENT);
  return raw ? JSON.parse(raw) : [];
}

export async function saveDietary(dietary: string[]) {
  await AsyncStorage.setItem(KEYS.DIETARY, JSON.stringify(dietary));
}
export async function loadDietary(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.DIETARY);
  return raw ? JSON.parse(raw) : [];
}

export async function loadSavedRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(KEYS.SAVED_RECIPES);
  return raw ? JSON.parse(raw) : [];
}
export async function saveRecipe(recipe: Recipe) {
  const existing = await loadSavedRecipes();
  if (!existing.find(r => r.id === recipe.id)) {
    await AsyncStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify([...existing, recipe]));
  }
}
export async function unsaveRecipe(recipeId: string) {
  const existing = await loadSavedRecipes();
  await AsyncStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(existing.filter(r => r.id !== recipeId)));
}
export async function isRecipeSaved(recipeId: string): Promise<boolean> {
  const existing = await loadSavedRecipes();
  return existing.some(r => r.id === recipeId);
}

export async function saveLastLocation(location: string) {
  await AsyncStorage.setItem(KEYS.LAST_LOCATION, location);
}
export async function loadLastLocation(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.LAST_LOCATION);
}
