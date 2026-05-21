# ============================
# Stage 1: deps + build
# ============================
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps with lockfile (reproducible)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source then build (Next.js standalone)
COPY . .
RUN npm run build

# ============================
# Stage 2: runtime (slim)
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Disable Next.js telemetry trên server
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user (Next image-suggested pattern)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone output bundles only what's needed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
