# Sistema de OCR para Transações

## 📸 Funcionalidades Implementadas

O sistema agora possui reconhecimento óptico de caracteres (OCR) para facilitar o cadastro de transações a partir de fotos de notas fiscais e comprovantes.

### Backend (API)

#### Módulos Criados

1. **OCR Service** (`apps/api/src/ocr/ocr.service.ts`)
   - Extração de texto usando Tesseract.js (português)
   - Identificação automática de:
     - **Valores monetários** (R$ 10,50)
     - **Nome do estabelecimento** (primeira linha geralmente)
     - **Data da transação** (formatos: dd/mm/yyyy, dd-mm-yyyy)
     - **Itens individuais** com valores
     - **Categoria sugerida** baseada em palavras-chave

2. **Attachments Service** (`apps/api/src/attachments/attachments.service.ts`)
   - Upload de arquivos (imagens e PDFs)
   - Armazenamento em `uploads/` directory
   - Processamento automático de OCR
   - Associação com transações

3. **Attachments Controller** (`apps/api/src/attachments/attachments.controller.ts`)
   - `POST /attachments/upload` - Upload com OCR
   - `GET /attachments/:id` - Buscar attachment
   - `GET /attachments/transaction/:id` - Attachments de uma transação
   - `GET /attachments/:id/download` - Download do arquivo
   - `DELETE /attachments/:id` - Remover attachment

#### Categorização Inteligente

O sistema identifica automaticamente categorias baseadas em palavras-chave:

- **Alimentação**: restaurante, padaria, mercado, supermercado, café, pizzaria
- **Transporte**: uber, taxi, combustível, gasolina, posto, estacionamento
- **Saúde**: farmácia, hospital, clínica, médico, dentista
- **Entretenimento**: cinema, teatro, show, netflix, spotify
- **Vestuário**: roupa, calçado, sapato, tênis, loja
- **Educação**: escola, faculdade, curso, livro
- **Serviços**: salão, barbearia, lavanderia, oficina

### Frontend (Web)

#### Componentes Criados

1. **FileUpload** (`apps/web/src/components/attachments/FileUpload.tsx`)
   - Drag-and-drop de arquivos
   - Preview de imagens
   - Suporte a JPG, PNG, PDF
   - Indicador de progresso

2. **Página de Upload OCR** (`apps/web/src/app/transactions/upload/page.tsx`)
   - Interface completa de upload
   - Visualização dos dados extraídos:
     - Valor total
     - Estabelecimento
     - Data
     - Categoria sugerida
     - Itens identificados
     - Texto bruto extraído
   - Barra de confiança do OCR
   - Botão para criar transação com dados pré-preenchidos

3. **Integração com TransactionForm**
   - Query params automáticos do OCR
   - Pre-preenchimento de campos:
     - `amount` - Valor
     - `description` - Nome do estabelecimento
     - `date` - Data convertida para yyyy-mm-dd
     - `categoryId` - Categoria sugerida
     - `flow` - Definido como 'expense'
   - Banner verde indicando origem dos dados

#### Fluxos de Uso

**Fluxo 1: Upload Dedicado**
1. Ir para `/transactions/upload`
2. Arrastar ou clicar para selecionar imagem
3. Aguardar processamento OCR
4. Revisar dados extraídos
5. Clicar em "Criar Transação com esses dados"
6. Revisar e ajustar campos no formulário
7. Salvar

**Fluxo 2: Acesso Rápido**
1. Na listagem de transações, clicar em "📷 Upload OCR"
2. Ou em "Nova Transação", clicar em "📷 Upload OCR"
3. Seguir fluxo 1

## 🚀 Como Usar

### 1. Tirar Foto do Comprovante

- Tire uma foto clara e bem iluminada
- Certifique-se que os valores estão legíveis
- Evite reflexos e sombras
- Formatos aceitos: JPG, PNG

### 2. Fazer Upload

```
Acesse: http://localhost:3000/transactions/upload
```

- Arraste a imagem para a área de upload
- Ou clique para selecionar do computador
- Aguarde o processamento (5-15 segundos)

### 3. Revisar Dados Extraídos

O sistema mostrará:
- ✅ **Confiança do OCR** - Quanto mais próximo de 100%, melhor
- 💰 **Valor** - Total identificado na nota
- 🏪 **Estabelecimento** - Nome do local
- 📅 **Data** - Data da transação
- 🏷️ **Categoria Sugerida** - Baseada em palavras-chave
- 📋 **Itens** - Lista de produtos/serviços (se identificados)

### 4. Criar Transação

- Clique em "Criar Transação com esses dados →"
- Os campos serão preenchidos automaticamente
- **Revise e ajuste** conforme necessário
- Selecione conta ou cartão
- Marque como planejada ou conciliada se aplicável
- Salve a transação

## 🔧 Dependências Instaladas

### Backend
```bash
npm install --save multer @nestjs/platform-express tesseract.js @types/multer
```

### Arquivos Tesseract
O Tesseract baixa automaticamente os dados de treinamento em português na primeira execução.

## 📊 Banco de Dados

### Tabelas Utilizadas

- `attachments` - Armazena metadados dos arquivos
- `ocr_extracts` - Resultado da análise OCR
- `transactions` - Vincula attachments a transações

### Schema
```prisma
model Attachment {
  id            String   @id @default(uuid())
  transactionId String?  @map("transaction_id")
  storageKey    String   @map("storage_key")
  mime          String
  size          Int
  createdAt     DateTime @default(now())
  
  transaction Transaction?
  ocrExtract  OcrExtract?
}

model OcrExtract {
  id           String   @id @default(uuid())
  attachmentId String   @unique
  rawText      String
  parsed       Json     // Dados estruturados
  confidence   Float
  createdAt    DateTime @default(now())
  
  attachment Attachment
}
```

## 🎯 Precisão e Limitações

### Funciona Bem
- ✅ Notas fiscais eletrônicas (NF-e) impressas
- ✅ Comprovantes de pagamento
- ✅ Cupons fiscais bem impressos
- ✅ Texto em português
- ✅ Fotos nítidas e bem iluminadas

### Pode Ter Dificuldades
- ⚠️ Fotos borradas ou escuras
- ⚠️ Texto manuscrito
- ⚠️ Fontes muito pequenas ou decorativas
- ⚠️ Papéis amassados ou danificados
- ⚠️ Idiomas diferentes de português

### Dicas para Melhor Precisão
1. Use boa iluminação
2. Mantenha o celular estável
3. Centralize o documento
4. Evite reflexos e sombras
5. Tire foto perpendicular ao papel

## 🔒 Segurança

- Arquivos armazenados em `apps/api/uploads/`
- Autenticação JWT obrigatória
- Usuário só acessa seus próprios attachments
- Arquivos deletados fisicamente ao remover attachment

## 🚧 Próximas Melhorias

- [ ] Compressão de imagens antes do upload
- [ ] Suporte a múltiplas páginas (PDF)
- [ ] OCR em lote (múltiplos arquivos)
- [ ] Machine Learning para melhor categorização
- [ ] Histórico de uploads com reprocessamento
- [ ] Cropping e rotação de imagem no frontend
- [ ] Cache de resultados OCR
- [ ] Integração com APIs externas (Google Vision, AWS Textract)

## 📞 Suporte

Em caso de problemas:
1. Verifique se o Tesseract baixou os dados de treinamento
2. Confirme que a pasta `uploads/` tem permissão de escrita
3. Teste com imagens diferentes
4. Veja os logs no console da API para detalhes do OCR
