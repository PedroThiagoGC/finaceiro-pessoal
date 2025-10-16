import { z } from 'zod';

// ========== ENUMS ==========
export const AccountTypeEnum = z.enum(['checking', 'savings', 'cash', 'other']);
export type AccountType = z.infer<typeof AccountTypeEnum>;

export const FlowEnum = z.enum(['expense', 'income', 'transfer']);
export type Flow = z.infer<typeof FlowEnum>;

export const CategoryTypeEnum = z.enum(['expense', 'income', 'transfer']);
export type CategoryType = z.infer<typeof CategoryTypeEnum>;

export const FrequencyEnum = z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']);
export type Frequency = z.infer<typeof FrequencyEnum>;

export const BudgetPeriodEnum = z.enum(['monthly', 'quarterly', 'annual']);
export type BudgetPeriod = z.infer<typeof BudgetPeriodEnum>;

// ========== AUTH SCHEMAS ==========
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ========== USER SCHEMAS ==========
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  emailVerifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof userSchema>;

// ========== ACCOUNT SCHEMAS ==========
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: AccountTypeEnum,
  openingBalance: z.number().default(0),
  currency: z.string().default('BRL'),
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const accountSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  type: AccountTypeEnum,
  openingBalance: z.number(),
  currency: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Account = z.infer<typeof accountSchema>;

// ========== CARD SCHEMAS ==========
export const createCardSchema = z.object({
  accountId: z.string().uuid().nullable().optional(),
  brand: z.string().min(1, 'Bandeira é obrigatória'),
  nickname: z.string().min(1, 'Apelido é obrigatório'),
  creditLimit: z.number().positive('Limite deve ser positivo'),
  billingDay: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const cardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  accountId: z.string().uuid().nullable(),
  brand: z.string(),
  nickname: z.string(),
  creditLimit: z.number(),
  billingDay: z.number(),
  dueDay: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Card = z.infer<typeof cardSchema>;

// ========== CATEGORY SCHEMAS ==========
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: CategoryTypeEnum,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato #RRGGBB)'),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const categorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  type: CategoryTypeEnum,
  color: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Category = z.infer<typeof categorySchema>;

// ========== MERCHANT SCHEMAS ==========
export const createMerchantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  defaultCategoryId: z.string().uuid().nullable().optional(),
});
export type CreateMerchantInput = z.infer<typeof createMerchantSchema>;

export const merchantSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  defaultCategoryId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Merchant = z.infer<typeof merchantSchema>;

// ========== LOAN SCHEMAS ==========
export const createLoanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  principal: z.number().positive('Valor principal deve ser positivo'),
  interestRateAnnual: z.number().min(0).max(100, 'Taxa deve estar entre 0 e 100%'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
  installmentDay: z.number().int().min(1).max(31),
  accountId: z.string().uuid(),
});
export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export const loanSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  principal: z.number(),
  interestRateAnnual: z.number(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  installmentDay: z.number(),
  accountId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Loan = z.infer<typeof loanSchema>;

// ========== RECURRING RULE SCHEMAS ==========
export const createRecurringRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().uuid(),
  amount: z.number().nullable().optional(),
  flow: FlowEnum,
  frequency: FrequencyEnum,
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).nullable().optional(),
});
export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleSchema>;

export const recurringRuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  categoryId: z.string().uuid(),
  amount: z.number().nullable(),
  flow: FlowEnum,
  frequency: FrequencyEnum,
  startDate: z.date(),
  endDate: z.date().nullable(),
  nextOccurrenceAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RecurringRule = z.infer<typeof recurringRuleSchema>;

// ========== TRANSACTION SCHEMAS ==========
export const createTransactionSchema = z.object({
  date: z.string().or(z.date()),
  description: z.string().min(1, 'Descrição é obrigatória'),
  merchantId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid(),
  flow: FlowEnum,
  amount: z.number().positive('Valor deve ser positivo'),
  accountId: z.string().uuid().nullable().optional(),
  cardId: z.string().uuid().nullable().optional(),
  planned: z.boolean().default(false),
  reconciled: z.boolean().default(false),
});
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const transactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.date(),
  description: z.string(),
  merchantId: z.string().uuid().nullable(),
  categoryId: z.string().uuid(),
  flow: FlowEnum,
  amount: z.number(),
  accountId: z.string().uuid().nullable(),
  cardId: z.string().uuid().nullable(),
  planned: z.boolean(),
  reconciled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Transaction = z.infer<typeof transactionSchema>;

// ========== BUDGET SCHEMAS ==========
export const createBudgetSchema = z.object({
  period: BudgetPeriodEnum,
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
});
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const budgetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  period: BudgetPeriodEnum,
  year: z.number(),
  month: z.number().nullable(),
  categoryId: z.string().uuid().nullable(),
  amount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Budget = z.infer<typeof budgetSchema>;

// ========== ATTACHMENT & OCR SCHEMAS ==========
export const attachmentSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  storageKey: z.string(),
  mime: z.string(),
  size: z.number(),
  createdAt: z.date(),
});
export type Attachment = z.infer<typeof attachmentSchema>;

export const ocrExtractSchema = z.object({
  id: z.string().uuid(),
  attachmentId: z.string().uuid(),
  rawText: z.string(),
  parsed: z.any(),
  confidence: z.number().min(0).max(100),
  createdAt: z.date(),
});
export type OcrExtract = z.infer<typeof ocrExtractSchema>;

// ========== ANALYTICS SCHEMAS ==========
export const analyticsOverviewSchema = z.object({
  totalIncome: z.number(),
  totalExpense: z.number(),
  totalBalance: z.number(),
  isInRed: z.boolean(),
  reasons: z.array(z.string()),
});
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;

export const spendByCardSchema = z.object({
  cardId: z.string().uuid(),
  cardNickname: z.string(),
  spend: z.number(),
});
export type SpendByCard = z.infer<typeof spendByCardSchema>;

export const spendByCategorySchema = z.object({
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  expense: z.number(),
  income: z.number(),
});
export type SpendByCategory = z.infer<typeof spendByCategorySchema>;

// ========== API RESPONSE ==========
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};
