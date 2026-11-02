import recipesData from '../data/recipes.json';
import {Recipe} from './api';

// The raw shape in our JSON
interface LocalRecipe {
  id: string;
  name: string;
  regions: string[];
  seasons: string[];
  equipment: string[];
  dietary: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: string;
  servings: number;
  description: string;
  localIngredients: string[];
  shopIngredients: string[];
  method: string[];
  tips: string;
  tags: string[];
}

const ALL_RECIPES: LocalRecipe[] = recipesData as LocalRecipe[];

export interface SearchParams {
  location: string;
  equipment: string[];
  season: string;
  dietaryRestrictions: string[];
}

export function searchRecipes(params: SearchParams): Recipe[] {
  const locationKeywords = params.location.toLowerCase().split(/[\s,]+/);

  let results = ALL_RECIPES.filter(recipe => {

    // 1. Equipment — must have at least one matching piece
    const hasEquipment = recipe.equipment.some(e =>
      params.equipment.map(p => p.toLowerCase()).includes(e.toLowerCase())
    );
    if (!hasEquipment) return false;

    // 2. Dietary — must satisfy all restrictions
    if (params.dietaryRestrictions.length > 0) {
      const recipeIsCompatible = params.dietaryRestrictions.every(restriction => {
        const r = restriction.toLowerCase();
        // If recipe has no dietary tags, it's not restricted (assume it contains everything)
        // Only filter if the recipe explicitly marks itself as compatible
        return recipe.dietary.map(d => d.toLowerCase()).includes(r) ||
               recipe.dietary.length === 0;
      });
      // Only strictly filter vegan/vegetarian/gluten-free/dairy-free
      const strictFilters = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free', 'halal'];
      const hasStrictFilter = params.dietaryRestrictions.some(r =>
        strictFilters.includes(r.toLowerCase())
      );
      if (hasStrictFilter) {
        const compatible = params.dietaryRestrictions
          .filter(r => strictFilters.includes(r.toLowerCase()))
          .every(restriction =>
            recipe.dietary.map(d => d.toLowerCase()).includes(restriction.toLowerCase())
          );
        if (!compatible) return false;
      }
    }

    return true;
  });

  // 3. Score by relevance — season and location matches boost the score
  const scored = results.map(recipe => {
    let score = 0;

    // Season match — big boost
    if (recipe.seasons.map(s => s.toLowerCase()).includes(params.season.toLowerCase())) {
      score += 10;
    }

    // Location/region match — boost for each keyword match
    locationKeywords.forEach(keyword => {
      if (keyword.length < 3) return; // skip short words like "in", "the"
      if (recipe.regions.some(r => r.toLowerCase().includes(keyword))) {
        score += 5;
      }
      // Also match tags
      if (recipe.tags.some(t => t.toLowerCase().includes(keyword))) {
        score += 2;
      }
    });

    // "general" region always gets a small base score
    if (recipe.regions.includes('general')) score += 1;

    return {recipe, score};
  });

  // Sort by score descending, then return top 4
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map(({recipe}) => ({
    ...recipe,
    ingredients: [...recipe.localIngredients, ...recipe.shopIngredients],
  }));
}

export function getLocalContext(location: string, season: string): string {
  const loc = location.toLowerCase();

  if (loc.includes('scotland') || loc.includes('highland')) {
    return `The Scottish Highlands offer exceptional wild larder — red deer, grouse, and freshwater fish in season. ${season === 'Autumn' ? 'Autumn brings chanterelle mushrooms, rowan berries, and sloes.' : season === 'Summer' ? 'Summer brings bilberries, wild raspberries, and sea trout.' : 'Wild garlic carpets the woodland floors in spring.'}`;
  }
  if (loc.includes('lake district') || loc.includes('cumbria')) {
    return `The Lake District is famous for Herdwick lamb, local dairy, and the tarns are full of brown trout. ${season === 'Autumn' ? 'Bilberries ripen on the fell tops and hedgerows are heavy with blackberries.' : season === 'Summer' ? 'Look for bilberries above 300m and fresh trout from local fishmongers.' : 'Wild garlic grows in the valley woodlands in spring.'}`;
  }
  if (loc.includes('coastal') || loc.includes('cornwall') || loc.includes('devon') || loc.includes('wales')) {
    return `The coastline offers superb seafood — mussels and limpets from the rocks, mackerel from local boats, and samphire from the salt marshes. ${season === 'Summer' ? 'Summer is prime time for crabbing and mackerel fishing.' : 'Winter brings the best mussels and oysters.'}`;
  }
  if (loc.includes('woodland') || loc.includes('forest') || loc.includes('new forest')) {
    return `Woodland camping opens up foraging possibilities — wild garlic in spring, mushrooms in autumn, and hedgerow fruits through summer and autumn. Always forage responsibly and only take what you can identify with certainty.`;
  }

  return `Local farm shops and markets are your best source of fresh, seasonal ingredients wherever you are in the UK. ${season === 'Autumn' ? 'Autumn is the richest season — root vegetables, squash, apples, and wild mushrooms abound.' : season === 'Summer' ? 'Summer brings abundant soft fruits, salad leaves, and fresh vegetables from farm shops.' : season === 'Spring' ? 'Spring means wild garlic, purple sprouting broccoli, and the first new season lamb.' : 'Winter is the time for hearty roots, stored squash, and warming one-pot meals.'}`;
}