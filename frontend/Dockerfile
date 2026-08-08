# --- Etapa 1: construir la app de React ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Etapa 2: servir los archivos estaticos con Nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

COPY generar-env.sh /docker-entrypoint.d/40-generar-env.sh
RUN chmod +x /docker-entrypoint.d/40-generar-env.sh

EXPOSE 80