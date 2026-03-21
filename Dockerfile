FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@8.13.0 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/wasm/package.json ./packages/wasm/
COPY apps/playground/package.json ./apps/playground/

# Copy source for workspace packages needed at install time
COPY packages/core/src ./packages/core/src

RUN pnpm install --no-frozen-lockfile


FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.13.0 --activate

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://hongik.api.tolelom.xyz
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build all packages in dependency order via turbo
RUN pnpm build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output contains only the minimum files needed
COPY --from=builder /app/apps/playground/.next/standalone ./
COPY --from=builder /app/apps/playground/.next/static ./apps/playground/.next/static
COPY --from=builder /app/apps/playground/public ./apps/playground/public

EXPOSE 3000

CMD ["node", "apps/playground/server.js"]
