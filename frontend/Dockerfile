# syntax=docker/dockerfile:1

# --- Etape 1 : compilation ---------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /build

# npm ci s'appuie sur le lock : installation reproductible, et la couche est
# reutilisee tant que les dependances ne bougent pas.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etape 2 : service des fichiers statiques --------------------------------
FROM nginx:1.27-alpine AS runtime

COPY --from=build /build/dist /usr/share/nginx/html
# L'image nginx applique envsubst aux gabarits de /etc/nginx/templates,
# en ne substituant que les variables reellement presentes dans
# l'environnement : les variables propres a nginx ($host, $uri) sont donc
# preservees telles quelles.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# PORT est impose par la plateforme, API_URL designe le backend a joindre.
ENV PORT=8080
ENV API_URL=http://backend:8080
EXPOSE 8080
