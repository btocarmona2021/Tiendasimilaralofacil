FROM node:20-alpine AS build-front
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
COPY --from=build-front /app/dist /usr/src/app/public
EXPOSE 3000
CMD ["node", "src/server.js"]
