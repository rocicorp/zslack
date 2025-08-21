# Hello Zero Expo

An Expo app (iOS/Android/Web) using Zero for realtime sync, with a Hono API, Better Auth, and Drizzle ORM (PostgreSQL). Shared types, schema, queries, and mutators live in the `shared` workspace.

## Option 1: Run this repo

### Prerequisites

- Node 20+ and npm
- Docker Desktop (for PostgreSQL)

### 1) Install dependencies

```sh
npm i
```

### 2) Create an .env

Set your Postgres connection string (this matches the Docker setup below).

```ini
# .env
DATABASE_URL=postgres://user:password@localhost:5430/postgres
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

Note: The client and cache/API URLs are configured in code for development:

- `lib/auth.ts` → `baseURL` (API, default 3000)
- `app/_layout.tsx` → `server` (Zero cache, default 4848)

If you are testing on a device, point these to your machine's LAN IP instead of `localhost`.

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

```12:36:app/_layout.tsx
  const zeroProps = useMemo(() => {
    return {
      storageKey: "hello-zero-expo",
      kvStore: expoSQLiteStoreProvider(),
      server: "http://localhost:4848", // set to your Zero cache URL
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
  const [channels] = useQuery(queries.allChannels(authData.data));
  // ...render list of channels...
```

For more examples (relationships, auth-guarded queries), see `shared/src/queries.ts` and `shared/src/zql.ts`.

### Optional: Authentication

This example uses Better Auth (with the Expo plugin) and a Drizzle adapter (Postgres). The API wires auth into Hono and passes the user/session to Zero routes.

- Auth setup: `api/src/auth.ts`
- Hono server + auth + Zero routes: `api/src/index.ts`

On the client, the Better Auth Expo client is initialized here:

```5:16:lib/auth.ts
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // API URL for dev
  plugins: [expoClient({ scheme: "hello-zero-expo", storagePrefix: "hello-zero-expo", storage: SecureStore })],
});
```

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

---

If you run into connectivity issues on a physical device, ensure the API (`:3000`) and Zero cache (`:4848`) hosts are reachable over your local network and that `lib/auth.ts` and `app/_layout.tsx` point to the correct URLs.
