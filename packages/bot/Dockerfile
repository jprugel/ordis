FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# First stage: Setup workspace
FROM base AS workspace
WORKDIR /usr/src/app
# Copy only the necessary workspace files
COPY package.json .
COPY bun.lock .
COPY packages/common packages/common
COPY packages/plugins packages/plugins
COPY packages/bot packages/bot

# Install dependencies without frozen lockfile first time
RUN bun install

# Production stage
FROM base AS release
WORKDIR /usr/src/app
# Copy only the required packages and their files
COPY --from=workspace /usr/src/app/packages/common/package.json ./packages/common/package.json
COPY --from=workspace /usr/src/app/packages/common/index.tsx ./packages/common/
COPY --from=workspace /usr/src/app/packages/plugins/ ./packages/plugins/
COPY --from=workspace /usr/src/app/packages/bot/package.json ./packages/bot/package.json
COPY --from=workspace /usr/src/app/packages/bot/index.ts ./packages/bot/
COPY --from=workspace /usr/src/app/node_modules ./node_modules
COPY --from=workspace /usr/src/app/package.json .
COPY --from=workspace /usr/src/app/bun.lock .

WORKDIR /usr/src/app/packages/bot

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
