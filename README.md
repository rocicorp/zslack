# zslack

An Expo app (iOS/Android/Web) using Zero for realtime sync, with a Hono API, Better Auth, and Drizzle ORM (PostgreSQL). Shared types, schema, queries, and mutators live in the `shared` workspace.

<a href="https://github.com/user-attachments/assets/f67cbff1-da4d-4b6d-ab0f-127ff5182537">
  <img alt="demo of expo with android, ios, and web" src="./scripts/web-demo.gif">
</a>

## Running

### Prerequisites

- Node and bun
- Docker (for PostgreSQL)

### 1) Install dependencies

```sh
bun i
```

### 2) Create an .env

```bash
cp .env.sample .env
```

### 3) Start PostgreSQL (Docker)

This brings up Postgres with WAL enabled and runs migrations from `migrations/`.

```sh
bun run dev:db-up
```

### 4) Start the Zero cache server (separate terminal)

This uses the Zero schema generated from Drizzle via `shared/src/zero-schema.gen.ts`.

```sh
bun run dev:zero-cache
```

### 5) Start the API server (separate terminal)

Hono server on port 3000. Requires `DATABASE_URL` in `.env`.

```sh
bun run dev:api
```

### 6) Start the Expo app (separate terminal)

Choose one of the following:

```sh
bun run dev:expo      # Expo dev menu
bun run ios           # iOS simulator
bun run android       # Android emulator
bun run web           # Expo for Web
```

Note: URLs are centralized in `lib/config.ts` with defaults for local development:

- Zero cache: `http://localhost:4848`
- API: `http://localhost:3000`

For production builds (TestFlight/App Store), configure URLs in `eas.json` under each build profile.

If testing on a physical device in development, update the hardcoded defaults in `lib/config.ts` to your machine's LAN IP.

Common utilities:

```sh
bun run dev:db-down   # Stop Postgres
bun run dev:clean     # Remove local replica/db volume (destructive)
```

## Deploying to TestFlight

This project is configured with EAS Build for iOS deployments.

### 1) Configure production URLs

Update `eas.json` with your production server URLs:

```json
"production": {
  "autoIncrement": true,
  "env": {
    "EXPO_PUBLIC_ZERO_CACHE_URL": "https://your-production-zero-cache.com",
    "EXPO_PUBLIC_API_URL": "https://your-production-api.com"
  }
}
```

### 2) Build for iOS

```bash
bunx eas-cli build --platform ios --profile production
```

### 3) Submit to TestFlight

```bash
bunx eas-cli submit --platform ios --latest
```

The build number will auto-increment on each production build. Once submitted, the build will appear in App Store Connect under TestFlight within 5-15 minutes.
