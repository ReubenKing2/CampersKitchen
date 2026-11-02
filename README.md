# 🔥 Camper's Kitchen (Expo)

> Cook wild. Eat well.

## Setup — 3 steps, no Xcode needed!

### Step 1 — Install Expo Go on your phone
- iPhone: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 2 — Install dependencies
Open Terminal in this folder and run:
```bash
npm install
```

### Step 3 — Start the app
```bash
npx expo start
```

A QR code will appear in the terminal. **Scan it with your phone camera (iPhone) or the Expo Go app (Android).**

The app will load on your phone instantly!

---

## Testing without an API key

The app has a built-in **demo mode** with real sample recipes so you can test everything without spending any credits:

- Tap **"Try with demo recipes"** on the Discover screen, or
- When prompted for an API key, tap **"Skip — use demo recipes"**

---

## Getting a real API key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Paste it into the app when prompted

Each recipe search costs approximately $0.01–0.02.

---

## Folder structure

```
campers-kitchen/
├── App.tsx                        # Navigation setup
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Discover + recipe results
│   │   ├── RecipeDetailScreen.tsx # Full recipe view
│   │   ├── EquipmentScreen.tsx    # Kit & dietary setup
│   │   └── SavedScreen.tsx        # Saved recipes
│   ├── components/
│   │   └── RecipeCard.tsx         # Recipe preview card
│   └── utils/
│       ├── api.ts                 # Claude AI integration + mock data
│       ├── storage.ts             # AsyncStorage helpers
│       └── theme.ts               # Colors, fonts, spacing
├── app.json                       # Expo config
└── package.json
```
