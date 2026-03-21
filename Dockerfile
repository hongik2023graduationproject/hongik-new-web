FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.13.0 --activate

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://hongik.api.tolelom.xyz
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .

RUN pnpm install --no-frozen-lockfile

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
