# zslack

An Expo app (iOS/Android/Web) using Zero for realtime sync, with a Hono API, Better Auth, and Drizzle ORM (PostgreSQL). Shared types, schema, queries, and mutators live in the `shared` workspace.

<a href="https://github.com/user-attachments/assets/f67cbff1-da4d-4b6d-ab0f-127ff5182537">
  <img alt="demo of expo with android, ios, and web" src="./scripts/web-demo.gif">
</a>

## Option 1: Run this repo

### Prerequisites

- Node 20+ and npm
- Docker Desktop (for PostgreSQL)

### 1) Install dependencies

```sh
npm i
```

### 2) Create an .env

```bash
cp .env.sample .env
```

### 3) Start PostgreSQL (Docker)

This brings up Postgres with WAL enabled and runs migrations from `migrations/`.

```sh
npm run dev:db-up
```

### 4) Start the Zero cache server (separate terminal)

This uses the Zero schema generated from Drizzle via `shared/src/schema.ts`.

```sh
npm run dev:zero-cache
```

### 5) Start the API server (separate terminal)

Hono server on port 3000. Requires `DATABASE_URL` in `.env`.

```sh
npm run dev:api
```

### 6) Start the Expo app (separate terminal)

Choose one of the following:

```sh
npm run dev:expo      # Expo dev menu
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Expo for Web
```

Note: URLs are centralized in `lib/config.ts` with defaults for local development:

- Zero cache: `http://localhost:4848`
- API: `http://localhost:3000`

For production builds (TestFlight/App Store), configure URLs in `eas.json` under each build profile.

If testing on a physical device in development, update the hardcoded defaults in `lib/config.ts` to your machine's LAN IP.

Common utilities:

```sh
npm run dev:db-down   # Stop Postgres
npm run dev:clean     # Remove local replica/db volume (destructive)
```

## Option 2: Install Zero in your own project

This guide explains how we set up Zero with Drizzle in this repo; you can mirror the approach in your app.

### Prerequisites

**1. PostgreSQL with WAL enabled**

This repo's Docker config enables WAL and applies migrations automatically. See `docker/docker-compose.yml`.

**2. Environment Variables**

Set the following in your environment:

```ini
DATABASE_URL=postgres://user:password@localhost:5430/postgres
```

### Setup

1. **Install packages**

```bash
npm install @rocicorp/zero drizzle-orm drizzle-zero pg zod
```

2. **Define Drizzle schema and generate Zero schema**

This repo defines Drizzle tables in `shared/src/db/schema` and generates a Zero schema via `drizzle-zero` into `shared/src/zero-schema.gen.ts`. The entry `shared/src/schema.ts` re-exports the generated schema and defines permissions.

Generate artifacts:

```bash
# Generates Zero schema and Drizzle migrations
npm run generate --workspace=shared
```

3. **Initialize Zero client-side**

We use Expo SQLite for local storage and provide auth and mutators from the shared module.

URLs are configured via `lib/config.ts`, which reads from environment variables (eas.json) or falls back to localhost defaults.

```app/_layout.tsx
  const zeroProps = useMemo(() => {
    return {
      storageKey: "zslack",
      kvStore: expoSQLiteStoreProvider(),
      server: config.zeroCacheUrl, // from lib/config.ts
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: authClient.getCookie(),
    } as const satisfies ZeroOptions<Schema, Mutators>;
  }, [authData]);
```

4. **Use Zero in components**

Queries are defined in `shared/src/queries.ts` and consumed with `useQuery`.

```21:62:app/index.tsx
  const authData = useSession();
  const [channels] = useQuery(queries.allChannels());
  // ...render list of channels...
```

For more examples (relationships, auth-guarded queries), see `shared/src/queries.ts` and `shared/src/zql.ts`.

### Optional: Authentication

This example uses Better Auth (with the Expo plugin) and a Drizzle adapter (Postgres). The API wires auth into Hono and passes the user/session to Zero routes.

- Auth setup: `api/src/auth.ts`
- Hono server + auth + Zero routes: `api/src/index.ts`

On the client, the Better Auth Expo client is initialized in `lib/auth.ts` and uses the centralized config for the API URL.

### Development

**1. Start PostgreSQL (Docker):**

```bash
npm run dev:db-up
```

**2. Start the Zero cache server (separate terminal):**

```bash
npm run dev:zero-cache
```

**3. Start the API server (separate terminal):**

```bash
npm run dev:api
```

**4. Start the Expo app:**

```bash
npm run dev:expo
```

### Migrations and Codegen

- Generate Zero schema and Drizzle migrations:

```bash
npm run generate --workspace=shared
```

- Apply migrations to the database (if not using Docker init):

```bash
npm run db:migrate --workspace=api
```

Migrations live in `migrations/` and are mounted into Postgres on container start.

### Deploying to TestFlight

This project is configured with EAS Build for iOS deployments.

**1. Configure production URLs**

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

**2. Build for iOS**

```bash
bunx eas-cli build --platform ios --profile production
```

**3. Submit to TestFlight**

```bash
bunx eas-cli submit --platform ios --latest
```

The build number will auto-increment on each production build. Once submitted, the build will appear in App Store Connect under TestFlight within 5-15 minutes.
