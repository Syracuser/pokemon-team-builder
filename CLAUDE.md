# Pokemon Team Builder - Project Notes

## Tech Stack
- Backend: Python FastAPI + MongoDB (motor) on port 8000
- Mobile: Expo (React Native) SDK 52
- Web Frontend: React + Vite on port 5173

## Known Issues & Solutions

### 1. Port 8081 already in use (BruhApp)
- Expo Metro bundler defaults to 8081, but BruhApp uses it
- Solution: Accept port 8082 when prompted, or run `npx expo start --port 8082`

### 2. Expo Router entry point
- The blank-typescript template creates `index.ts` importing `./App`
- Expo Router requires `"main": "expo-router/entry"` in package.json
- And `index.ts` must contain only `import "expo-router/entry";`
- The old `App.tsx` must be deleted (expo-router uses `app/` directory)

### 3. Expo Go incompatible with SDK 55 — RESOLVED
- SDK 55 (React 19 + RN 0.83) was too new for current Expo Go on Play Store
- `react-native-web@0.21.2` (latest stable) is NOT compatible with React 19
- **Solution applied**: Downgraded to SDK 52 (React 18.3.1, RN 0.76.7, react-native-web 0.19.13)
- SDK 52 works with Expo Go and web support

### 4. Web support missing dependencies
- `react-native-web`, `react-dom`, `@expo/metro-runtime` must be installed
- Run: `npx expo install react-native-web react-dom @expo/metro-runtime`

### 5. Web bundling 500 error / MIME type error (Expo web) — RESOLVED
- Was caused by react-native-web 0.21.x incompatible with React 19 (SDK 55)
- **Solution applied**: Downgraded to SDK 52 with react-native-web 0.19.13

## Port Assignments
- 8000: FastAPI backend
- 8081: RESERVED (BruhApp)
- 8082: Expo Metro bundler
- 5173: Vite web frontend (default)

## Sprite URLs (pokesprite - up to Gen 8)
- Pokemon: `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/{name}.png`
- Items: `https://raw.githubusercontent.com/msikma/pokesprite/master/items/{item-slug}.png`
- Item slug: lowercase, spaces replaced with hyphens (e.g. "life-orb")
- Gen 9 Pokemon won't have sprites from this source (known limitation, accepted)

## Mobile API Base URL
- Android emulator: `http://10.0.2.2:8000/api`
- Physical device: replace with machine's local IP

## Backend Caching
- Pokemon list (1302 entries) is cached in-memory after first request
- Items list is cached in-memory after first request
- Search is done server-side against cached lists (instant after warmup)
