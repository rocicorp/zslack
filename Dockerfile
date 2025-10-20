FROM oven/bun AS base
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json files for workspace setup
COPY package.json bun.lock ./
COPY api/package.json ./api/
COPY shared/package.json ./shared/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
COPY api/src ./api/src
COPY api/tsconfig.json ./api/

# Environment variables
ENV ZERO_UPSTREAM_DB="postgres://user:password@zslack_postgres:5432/postgres"

# Expose the API port
EXPOSE 3000

# Run the API (production mode without watch)
CMD ["bun", "api/src/index.ts"]
