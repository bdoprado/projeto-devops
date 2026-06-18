# ── Estágio 1: build da aplicação ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Instala dependências a partir do lockfile (camada cacheável)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código-fonte e gera o build de produção em /app/dist
COPY . .
RUN npm run build

# ── Estágio 2: imagem final de runtime (servidor estático) ───────────────────
FROM nginx:1.27-alpine AS runtime

# Configuração do nginx para SPA (roteamento client-side, gzip, headers de segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# Copia apenas os artefatos estáticos do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck: o container só é considerado saudável se o nginx responder
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
