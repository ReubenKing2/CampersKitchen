// Define the new Gemini API URL base
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface RecipeRequest {
  location: string;
  equipment: string[];
  season?: string;
  dietaryRestrictions?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  ingredients: string[];
  localIngredients: string[];
  shopIngredients: string[];
  method: string[];
  equipment: string[];
  tips: string;
  tags: string[];
}

export interface RecipeResponse {
  recipes: Recipe[];
  localContext: string;
}

const SYSTEM_PROMPT = `You are Camper's Kitchen, an expert outdoor cooking assistant.
You help campers, hikers, and travellers cook delicious meals using:
- Ingredients locally available in their area (foraged, farm shops, local markets, fishing)
- The cooking equipment they have with them
- Practical campsite techniques

Always respond with a JSON object matching this exact shape:
{
  "localContext": "2-3 sentences about what's locally available/seasonally relevant in this region",
  "recipes": [
    {
      "id": "unique-slug",
      "name": "Recipe Name",
      "description": "1-2 sentence evocative description",
      "cookTime": "25 minutes",
      "difficulty": "Easy",
      "servings": 2,
      "ingredients": ["full ingredient list with quantities"],
      "localIngredients": ["ingredients to find locally / forage"],
      "shopIngredients": ["ingredients to bring or buy at a local shop"],
      "method": ["Step 1 instruction", "Step 2 instruction"],
      "equipment": ["camp stove", "pan"],
      "tips": "One practical campsite tip",
      "tags": ["vegetarian", "one-pot", "quick"]
    }
  ]
}

Return exactly 4 recipes. Prioritise local, seasonal ingredients. Keep methods practical for outdoor cooking.
Only return valid JSON — no markdown, no explanation outside the JSON.`;

import { GEMINI_API_KEY } from './constants';

export async function getRecipeRecommendations(
  request: RecipeRequest,
): Promise<RecipeResponse> {
  const parts: string[] = [];
  parts.push(`My location: ${request.location}`);
  if (request.season) parts.push(`Current season: ${request.season}`);
  parts.push(`\nCooking equipment I have:`);
  request.equipment.forEach(e => parts.push(`  - ${e}`));
  if (request.dietaryRestrictions?.length) {
    parts.push(`\nDietary requirements: ${request.dietaryRestrictions.join(', ')}`);
  }
  parts.push('\nPlease suggest 4 recipes that work well with my equipment and use ingredients I can source locally.');

  // Construct the full URL with the model and API key
const modelName = 'gemini-3.6-flash';  // fix the model name too
const url = `${GEMINI_API_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: parts.join('\n') }]
      }],
      generationConfig: {
        // Enforce JSON output at the API level
        responseMimeType: "application/json",
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`API error ${response.status}: ${(error as any)?.error?.message ?? 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Extract text from the Gemini response structure
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Gemini's JSON mode usually omits markdown ticks, but we'll leave the cleanup just in case
  const clean = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(clean) as RecipeResponse;
}

export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

// ── Mock data for testing without an API key ──────────────────
export const MOCK_RESPONSE: RecipeResponse = {
  // ... (Mock data remains exactly the same as your original file)
  localContext: "The Lake District in late summer offers an abundance of wild bilberries on the fells, fresh-caught trout from the tarns, and lamb from local farms. Hedgerows are heavy with elderberries and blackberries right now.",
  recipes: [
    {
      id: "fell-trout-butter",
      name: "Fell Trout with Brown Butter & Herbs",
      description: "A beautifully simple way to cook fresh-caught trout over a camp stove — crispy skin, nutty butter, and wild herbs from the lakeside.",
      cookTime: "15 minutes",
      difficulty: "Easy",
      servings: 2,
      ingredients: ["2 fresh trout, gutted", "50g butter", "2 garlic cloves", "Fresh thyme", "Salt & pepper", "1 lemon"],
      localIngredients: ["Fresh trout (caught from nearby tarn)", "Wild thyme from the fells"],
      shopIngredients: ["Butter", "Garlic", "Lemon", "Salt & pepper"],
      method: [
        "Season the trout generously inside and out with salt and pepper.",
        "Heat a cast iron skillet over medium-high heat until very hot.",
        "Add butter and let it foam, then add the trout.",
        "Cook 4 minutes each side until skin is crispy.",
        "Add garlic and thyme in the last minute, basting the fish.",
        "Finish with a squeeze of lemon and serve immediately."
      ],
      equipment: ["Cast iron skillet", "Camp stove"],
      tips: "Make sure your pan is properly hot before the fish goes in — this is the secret to non-stick crispy skin without any special coating.",
      tags: ["pescatarian", "quick", "one-pan", "gluten-free"]
    },
    {
      id: "bilberry-oat-porridge",
      name: "Wild Bilberry & Oat Porridge",
      description: "Creamy morning porridge topped with freshly foraged bilberries — a proper fell-walker's breakfast.",
      cookTime: "10 minutes",
      difficulty: "Easy",
      servings: 2,
      ingredients: ["150g rolled oats", "400ml water", "100ml milk", "Handful wild bilberries", "2 tbsp honey", "Pinch of salt"],
      localIngredients: ["Wild bilberries (foraged from the fell tops)"],
      shopIngredients: ["Rolled oats", "Milk", "Honey", "Salt"],
      method: [
        "Bring water and milk to a gentle simmer in your pot.",
        "Stir in the oats and salt.",
        "Cook for 5-7 minutes, stirring occasionally, until thick and creamy.",
        "Serve topped with fresh bilberries and a drizzle of honey."
      ],
      equipment: ["Pot / saucepan", "Camp stove"],
      tips: "Bilberries grow low on the fells above 300m — look for the small dark blue berries in late July to September. They're smaller and more intensely flavoured than blueberries.",
      tags: ["vegetarian", "breakfast", "quick", "foraged"]
    },
    {
      id: "lamb-campfire-stew",
      name: "Lake District Lamb & Root Stew",
      description: "A hearty one-pot stew using local Herdwick lamb and seasonal root vegetables — perfect after a long day on the fells.",
      cookTime: "45 minutes",
      difficulty: "Medium",
      servings: 3,
      ingredients: ["400g lamb shoulder, diced", "2 carrots, chopped", "2 potatoes, diced", "1 onion, diced", "500ml stock", "2 tbsp flour", "Rosemary", "Salt & pepper"],
      localIngredients: ["Herdwick lamb (from local farm shop)", "Rosemary (wild from the fells)"],
      shopIngredients: ["Carrots", "Potatoes", "Onion", "Stock cube", "Flour"],
      method: [
        "Brown the lamb in batches in a hot Dutch oven — don't crowd the pan.",
        "Add onion and cook until softened.",
        "Stir in flour and cook for 1 minute.",
        "Add stock, carrots, potatoes and rosemary.",
        "Simmer with lid on for 35-40 minutes until lamb is tender.",
        "Season well and serve with bread."
      ],
      equipment: ["Dutch oven", "Camp stove"],
      tips: "Herdwick lamb from the Lake District has an intensely rich, slightly gamey flavour from grazing on the fells. Ask at any local farm shop — it's far superior to supermarket lamb.",
      tags: ["hearty", "one-pot", "autumn", "gluten-free-option"]
    },
    {
      id: "elderberry-camp-cake",
      name: "Campfire Elderberry Flatbreads",
      description: "Simple flatbreads cooked directly on the griddle, served with a quick elderberry compote — a surprisingly special campsite pudding.",
      cookTime: "20 minutes",
      difficulty: "Easy",
      servings: 4,
      ingredients: ["200g self-raising flour", "150ml yoghurt", "Pinch salt", "Handful elderberries", "2 tbsp sugar", "Splash water"],
      localIngredients: ["Elderberries (from hedgerows — ripe from late August)"],
      shopIngredients: ["Self-raising flour", "Yoghurt", "Sugar", "Salt"],
      method: [
        "Mix flour, salt and yoghurt into a soft dough — add a splash of water if needed.",
        "Divide into 4 balls and flatten each to about 5mm thick.",
        "Cook on a dry hot griddle for 2-3 minutes each side until puffed and charred.",
        "Meanwhile, simmer elderberries with sugar and a splash of water for 5 minutes to make compote.",
        "Serve flatbreads warm with the elderberry compote."
      ],
      equipment: ["Griddle pan", "Camp stove", "Pot / saucepan"],
      tips: "Never eat raw elderberries — always cook them. The flatbread dough works with plain flour too, just add 1 tsp baking powder.",
      tags: ["vegetarian", "dessert", "foraged", "quick"]
    }
  ]
};
