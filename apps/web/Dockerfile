FROM node:18-alpine

WORKDIR /app

# Copiar tsconfig da raiz
COPY tsconfig.json /tsconfig.json

# Copiar packages/types primeiro
COPY packages/types /app/packages/types

# Instalar dependências do types
WORKDIR /app/packages/types
RUN npm install

# Voltar para diretório do Web
WORKDIR /app/web

# Copiar package.json e configurações
COPY apps/web/package*.json ./
COPY apps/web/tsconfig*.json ./
COPY apps/web/next.config.js ./
COPY apps/web/tailwind.config.js ./
COPY apps/web/postcss.config.js ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY apps/web/src ./src
COPY apps/web/public ./public

# Expor porta
EXPOSE 3000

# Comando de início
CMD ["npm", "run", "dev"]
