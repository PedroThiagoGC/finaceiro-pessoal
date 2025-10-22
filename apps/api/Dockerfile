FROM node:18-alpine

WORKDIR /app

# Copiar packages/types primeiro
COPY packages/types /app/packages/types

# Instalar dependências do types
WORKDIR /app/packages/types
RUN npm install

# Voltar para diretório da API
WORKDIR /app/api

# Copiar package files e configurações da API
COPY apps/api/package*.json ./
COPY apps/api/tsconfig*.json ./
COPY apps/api/nest-cli.json ./

# Instalar TODAS as dependências (incluindo devDependencies)
RUN npm install

# Copiar prisma schema
COPY apps/api/prisma ./prisma

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY apps/api/src ./src

# Expor porta
EXPOSE 4000

# Comando de início
CMD ["npm", "run", "dev"]
