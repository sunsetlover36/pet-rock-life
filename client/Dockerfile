FROM node:22-alpine AS deps
WORKDIR /app
COPY ../../pnpm-workspace.yaml ../../package.json ../../pnpm-lock.yaml ./
COPY ./package.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]