FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY apps/playground/.next/standalone ./
COPY apps/playground/.next/static ./apps/playground/.next/static
COPY apps/playground/public ./apps/playground/public

EXPOSE 3000

CMD ["node", "apps/playground/server.js"]
