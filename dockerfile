FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS build
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM caddy:alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80