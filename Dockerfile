# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install ALL deps (incl. dev) to compile TS
COPY package*.json ./
RUN npm ci

# Copy source and build -> creates /dist
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install ONLY prod deps for smaller image
COPY package*.json ./
RUN npm ci --omit=dev

# Bring in compiled app + static assets (email templates, etc.)
COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static

# Railway provides PORT env; your app reads process.env.PORT
CMD ["node", "dist/index.js"]
