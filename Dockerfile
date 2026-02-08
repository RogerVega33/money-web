# compilación
FROM node:16 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# despliegue
FROM nginx:stable-alpine-slim AS production-stage
RUN apk add --no-cache gettext
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.template.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
CMD ["/docker-entrypoint.sh"]