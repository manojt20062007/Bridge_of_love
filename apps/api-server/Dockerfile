FROM node:20-alpine AS builder

WORKDIR /app

# Copy root monorepo files
COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/api-server/package*.json ./apps/api-server/
COPY apps/api-server/tsconfig*.json ./apps/api-server/
COPY apps/api-server/prisma/ ./apps/api-server/prisma/
COPY apps/api-server/src/ ./apps/api-server/src/

# Install dependencies & generate prisma
RUN npm ci
RUN npm run build --workspaces

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api-server/dist/ ./apps/api-server/dist/
COPY --from=builder /app/apps/api-server/package*.json ./apps/api-server/
COPY --from=builder /app/apps/api-server/prisma/ ./apps/api-server/prisma/

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace=@bridge-of-love/api-server"]
