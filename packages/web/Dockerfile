# Base stage with Bun
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Dependencies stage
FROM base AS deps
WORKDIR /usr/src/app
# Copy workspace files
COPY package.json .
COPY bun.lock .
COPY packages/common packages/common
COPY packages/plugins packages/plugins
COPY packages/web packages/web
# Install dependencies
RUN bun install

# Build stage
FROM deps AS builder
WORKDIR /usr/src/app
# Copy all source files including vite.config
COPY . .
# Ensure proper environment for build
ENV NODE_ENV=production
# Run the build from the package directory
RUN cd packages/web && bun run build

# Production stage
FROM base AS production
WORKDIR /usr/src/app
# Copy production files
COPY --from=deps /usr/src/app/packages/common ./packages/common
COPY --from=deps /usr/src/app/packages/web/package.json ./packages/web/package.json
COPY --from=deps /usr/src/app/packages/web/vite.config.ts ./packages/web/vite.config.ts
COPY --from=deps /usr/src/app/packages/plugins/ ./packages/plugins
COPY --from=builder /usr/src/app/packages/web/build ./packages/web/build
COPY --from=builder /usr/src/app/packages/web/public ./packages/web/public
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package.json .
COPY --from=deps /usr/src/app/bun.lock .

WORKDIR /usr/src/app/packages/web

# Set environment variables
ENV NODE_ENV=production
ENV PORT=33251

# Expose the port
EXPOSE 33251

USER bun

# Start the server
CMD ["bun", "run", "start"]
