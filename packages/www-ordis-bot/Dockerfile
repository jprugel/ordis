# Use the official Bun image
FROM oven/bun:latest as base
WORKDIR /app

# Install dependencies
FROM base as install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

# Build stage
FROM base as build
COPY --from=install /temp/prod/node_modules node_modules
COPY . .
RUN bun run build

# Production stage
FROM base as production
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /app/build /app/build
COPY package.json .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=33251

# Expose the port
EXPOSE 33251

# Start the server
CMD ["bun", "run", "start"]
