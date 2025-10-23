# 📚 Swagger API Documentation - Melhorias Implementadas

## 🎯 Visão Geral

A documentação Swagger da API PWR Finanças foi completamente aprimorada com informações detalhadas, exemplos práticos e uma interface mais profissional.

## ✨ Melhorias Implementadas

### 1. **Configuração Avançada do Swagger** (`main.ts`)

#### Informações Detalhadas
- ✅ Título e descrição expandida com markdown
- ✅ Versão da API
- ✅ Informações de contato e licença
- ✅ Múltiplos servidores (desenvolvimento e produção)

#### Tags Organizadas
- 🔐 **auth** - Autenticação
- 💰 **accounts** - Contas bancárias
- 💳 **cards** - Cartões de crédito
- 📊 **categories** - Categorias
- 💸 **transactions** - Transações
- 📈 **analytics** - Analytics e relatórios

#### Autenticação JWT
- Esquema Bearer Auth configurado
- Descrição clara do formato
- Persistência de autenticação habilitada

#### Interface Customizada
```typescript
customSiteTitle: 'PWR Finanças API - Documentação'
customCss: CSS personalizado para melhor visual
swaggerOptions:
  - persistAuthorization: true
  - docExpansion: 'none'
  - filter: true
  - showRequestDuration: true
  - syntaxHighlight: tema monokai
```

### 2. **DTOs com Validação e Documentação**

Criados DTOs dedicados para cada módulo com decoradores `@ApiProperty`:

#### Auth DTOs
- ✅ `RegisterDto` - Registro de usuário
- ✅ `LoginDto` - Login
- ✅ `AuthResponseDto` - Resposta de autenticação
- ✅ `UserDto` - Dados do usuário

#### Account DTOs
- ✅ `CreateAccountDto` - Criar conta
- ✅ `UpdateAccountDto` - Atualizar conta
- ✅ `AccountDto` - Dados da conta

#### Category DTOs
- ✅ `CreateCategoryDto` - Criar categoria
- ✅ `UpdateCategoryDto` - Atualizar categoria
- ✅ `CategoryDto` - Dados da categoria

#### Card DTOs
- ✅ `CreateCardDto` - Criar cartão
- ✅ `UpdateCardDto` - Atualizar cartão
- ✅ `CardDto` - Dados do cartão

#### Transaction DTOs
- ✅ `CreateTransactionDto` - Criar transação
- ✅ `UpdateTransactionDto` - Atualizar transação
- ✅ `TransactionDto` - Dados da transação

#### Common DTOs
- ✅ `ApiResponseDto` - Resposta padrão da API
- ✅ `ErrorResponseDto` - Resposta de erro

### 3. **Documentação Detalhada nos Controllers**

Todos os controllers foram aprimorados com:

#### Decoradores Swagger
- ✅ `@ApiOperation` - Descrição da operação
- ✅ `@ApiResponse` - Respostas possíveis (200, 201, 400, 404, etc.)
- ✅ `@ApiBody` - Esquema do corpo da requisição
- ✅ `@ApiParam` - Parâmetros de URL
- ✅ `@ApiQuery` - Parâmetros de query
- ✅ `@ApiBearerAuth` - Autenticação requerida

#### Exemplos de Código

**Auth Controller:**
```typescript
@Post('login')
@ApiOperation({ 
  summary: 'Login de usuário',
  description: 'Autentica um usuário e retorna um token JWT válido por 7 dias.',
})
@ApiBody({ type: LoginDto })
@SwaggerResponse({ 
  status: 200, 
  description: 'Login realizado com sucesso',
  type: AuthResponseDto,
})
@SwaggerResponse({ 
  status: 401, 
  description: 'Credenciais inválidas',
})
```

**Transactions Controller:**
```typescript
@Post()
@ApiOperation({ 
  summary: 'Criar transação',
  description: `Cria uma nova transação financeira.
  
**Tipos de transação:**
- **INCOME**: Receita - requer accountId e categoryId
- **EXPENSE**: Despesa - requer (accountId ou cardId) e categoryId  
- **TRANSFER**: Transferência - requer fromAccountId e toAccountId`,
})
@ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
```

### 4. **Schemas com Exemplos Práticos**

Todos os DTOs contêm exemplos realistas:

```typescript
@ApiProperty({
  description: 'Nome da conta',
  example: 'Conta Corrente Banco do Brasil',
  minLength: 3,
})
name: string;

@ApiProperty({
  description: 'Tipo da conta',
  enum: ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CASH', 'OTHER'],
  example: 'CHECKING',
})
type: string;
```

### 5. **Validações com Class Validator**

Integração entre validação e documentação:

```typescript
@ApiProperty({ minimum: 0.01 })
@IsNumber()
@Min(0.01)
amount: number;

@ApiProperty({ minLength: 3 })
@IsString()
@MinLength(3)
description: string;
```

## 📋 Estrutura da Documentação

### Endpoints de Autenticação
```
POST   /auth/register     - Registrar novo usuário
POST   /auth/login        - Login de usuário
GET    /auth/me          - Obter dados do usuário atual
```

### Endpoints de Contas
```
POST   /accounts          - Criar conta
GET    /accounts          - Listar contas
GET    /accounts/:id      - Obter conta por ID
GET    /accounts/:id/balance - Obter saldo da conta
PUT    /accounts/:id      - Atualizar conta
DELETE /accounts/:id      - Deletar conta
```

### Endpoints de Cartões
```
POST   /cards             - Criar cartão
GET    /cards             - Listar cartões
GET    /cards/:id         - Obter cartão por ID
GET    /cards/:id/invoice - Obter fatura do cartão
PUT    /cards/:id         - Atualizar cartão
DELETE /cards/:id         - Deletar cartão
```

### Endpoints de Categorias
```
POST   /categories        - Criar categoria
GET    /categories        - Listar categorias
GET    /categories/:id    - Obter categoria por ID
PUT    /categories/:id    - Atualizar categoria
DELETE /categories/:id    - Deletar categoria
```

### Endpoints de Transações
```
POST   /transactions              - Criar transação
GET    /transactions              - Listar transações (com filtros)
GET    /transactions/:id          - Obter transação por ID
PUT    /transactions/:id          - Atualizar transação
DELETE /transactions/:id          - Deletar transação
POST   /transactions/:id/reconcile - Conciliar transação
```

### Endpoints de Analytics
```
GET    /analytics/overview     - Visão geral financeira
GET    /analytics/by-category  - Gastos por categoria
GET    /analytics/by-card      - Gastos por cartão
GET    /analytics/cashflow     - Cashflow diário do mês
```

## 🚀 Como Usar

### 1. Acessar a Documentação

```bash
# Inicie o servidor
npm run dev

# Acesse no navegador
http://localhost:4000/api/docs
```

### 2. Autenticar na Interface

1. Clique em "Authorize" no topo da página
2. Faça login via `POST /auth/login` para obter o token
3. Copie o `accessToken` da resposta
4. Cole no campo de autorização (sem "Bearer ")
5. Clique em "Authorize"

### 3. Testar Endpoints

Cada endpoint pode ser testado diretamente na interface:
- Clique em "Try it out"
- Preencha os parâmetros (com exemplos pré-preenchidos)
- Clique em "Execute"
- Veja a resposta e o código HTTP

## 💡 Exemplos de Uso

### Criar uma Conta

```json
POST /accounts
{
  "name": "Conta Corrente Banco do Brasil",
  "type": "CHECKING",
  "openingBalance": 1000.50,
  "color": "#4CAF50"
}
```

### Criar uma Transação de Despesa

```json
POST /transactions
{
  "description": "Compra no supermercado",
  "amount": 150.75,
  "date": "2024-01-15T10:30:00.000Z",
  "type": "EXPENSE",
  "categoryId": "cm2x1y2z3...",
  "accountId": "cm2x1y2z4...",
  "notes": "Compras da semana"
}
```

### Obter Visão Geral Financeira

```
GET /analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

## 📊 Códigos de Status HTTP

### Sucesso
- **200** - OK (operação bem-sucedida)
- **201** - Created (recurso criado)

### Erros do Cliente
- **400** - Bad Request (dados inválidos)
- **401** - Unauthorized (não autenticado)
- **404** - Not Found (recurso não encontrado)
- **409** - Conflict (conflito, ex: nome duplicado)

### Erros do Servidor
- **500** - Internal Server Error (erro no servidor)

## 🎨 Melhorias Visuais

### CSS Customizado
- Topbar ocultada
- Container de informações com mais espaço
- Esquema com fundo cinza claro
- Bordas arredondadas

### Syntax Highlighting
- Tema Monokai para melhor legibilidade
- Destaque de JSON/código

### Filtros e Busca
- Campo de busca habilitado
- Filtragem por tags
- Agrupamento por módulos

## 🔍 Recursos Adicionados

### Persistência de Autenticação
O token JWT é salvo no localStorage do navegador, mantendo a autenticação entre refreshes.

### Medição de Duração
Exibe o tempo de resposta de cada requisição.

### Expansão Controlada
Documentação começa contraída para melhor navegação.

### Schemas Interativos
Todos os modelos são interativos e exibem exemplos ao clicar.

## 📖 Tipos Documentados

### Tipos de Conta (Account Type)
- `CHECKING` - Conta Corrente
- `SAVINGS` - Poupança
- `INVESTMENT` - Investimentos
- `CASH` - Dinheiro
- `OTHER` - Outros

### Tipos de Transação (Transaction Type)
- `INCOME` - Receita (entrada)
- `EXPENSE` - Despesa (saída)
- `TRANSFER` - Transferência entre contas

### Tipos de Categoria (Category Type)
- `INCOME` - Receita
- `EXPENSE` - Despesa

## 🎯 Benefícios

### Para Desenvolvedores
- ✅ Documentação sempre atualizada
- ✅ Exemplos práticos e realistas
- ✅ Validações claras
- ✅ Códigos de erro documentados
- ✅ Fácil teste de endpoints

### Para Integrações
- ✅ API clara e bem documentada
- ✅ Schemas exportáveis (OpenAPI 3.0)
- ✅ Geração de código cliente facilitada
- ✅ Contratos de API bem definidos

### Para o Projeto
- ✅ Profissionalismo
- ✅ Facilita onboarding
- ✅ Reduz erros de integração
- ✅ Melhora manutenibilidade

## 🔧 Manutenção

Sempre que adicionar novos endpoints:

1. Crie DTOs com `@ApiProperty`
2. Adicione `@ApiOperation` com descrição
3. Documente respostas com `@ApiResponse`
4. Adicione exemplos realistas
5. Documente parâmetros e queries
6. Teste na interface Swagger

## 📚 Referências

- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI 3.0](https://swagger.io/specification/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

---

**Acesse agora:** http://localhost:4000/api/docs 🚀
