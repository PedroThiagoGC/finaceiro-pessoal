-- Dados iniciais para teste
-- Execute este arquivo DEPOIS do setup-database.sql

-- Usuário demo (senha: demo123456)
-- Hash gerado com bcrypt, 10 rounds
INSERT INTO "users" ("id", "name", "email", "password_hash", "created_at", "updated_at") 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Usuário Demo',
    'demo@pwrfinancas.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Categorias padrão
INSERT INTO "categories" ("id", "user_id", "name", "type", "color", "created_at", "updated_at") VALUES
('cat-01', '550e8400-e29b-41d4-a716-446655440000', 'Alimentação', 'expense', '#FF6B6B', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-02', '550e8400-e29b-41d4-a716-446655440000', 'Transporte', 'expense', '#4ECDC4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-03', '550e8400-e29b-41d4-a716-446655440000', 'Moradia', 'expense', '#45B7D1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-04', '550e8400-e29b-41d4-a716-446655440000', 'Saúde', 'expense', '#96CEB4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-05', '550e8400-e29b-41d4-a716-446655440000', 'Educação', 'expense', '#FFEAA7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-06', '550e8400-e29b-41d4-a716-446655440000', 'Lazer', 'expense', '#DFE6E9', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-07', '550e8400-e29b-41d4-a716-446655440000', 'Compras', 'expense', '#74B9FF', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-08', '550e8400-e29b-41d4-a716-446655440000', 'Serviços', 'expense', '#A29BFE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-09', '550e8400-e29b-41d4-a716-446655440000', 'Investimentos', 'expense', '#FD79A8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-10', '550e8400-e29b-41d4-a716-446655440000', 'Outros Gastos', 'expense', '#FDCB6E', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-11', '550e8400-e29b-41d4-a716-446655440000', 'Salário', 'income', '#00B894', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-12', '550e8400-e29b-41d4-a716-446655440000', 'Freelance', 'income', '#00CEC9', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-13', '550e8400-e29b-41d4-a716-446655440000', 'Investimentos', 'income', '#81ECEC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-14', '550e8400-e29b-41d4-a716-446655440000', 'Outras Receitas', 'income', '#55EFC4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Conta corrente demo
INSERT INTO "accounts" ("id", "user_id", "name", "type", "opening_balance", "currency", "created_at", "updated_at") VALUES
('acc-01', '550e8400-e29b-41d4-a716-446655440000', 'Conta Corrente Principal', 'checking', 5000.00, 'BRL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('acc-02', '550e8400-e29b-41d4-a716-446655440000', 'Poupança', 'savings', 10000.00, 'BRL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('acc-03', '550e8400-e29b-41d4-a716-446655440000', 'Carteira', 'cash', 500.00, 'BRL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Cartão de crédito demo
INSERT INTO "cards" ("id", "user_id", "account_id", "brand", "nickname", "credit_limit", "billing_day", "due_day", "created_at", "updated_at") VALUES
('card-01', '550e8400-e29b-41d4-a716-446655440000', 'acc-01', 'Visa', 'Cartão Principal', 5000.00, 5, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('card-02', '550e8400-e29b-41d4-a716-446655440000', 'acc-01', 'Mastercard', 'Cartão Reserva', 3000.00, 10, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Algumas transações de exemplo
INSERT INTO "transactions" ("id", "user_id", "date", "description", "category_id", "flow", "amount", "account_id", "planned", "reconciled", "created_at", "updated_at") VALUES
('trans-01', '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Supermercado XYZ', 'cat-01', 'expense', 250.50, 'acc-01', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('trans-02', '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Uber', 'cat-02', 'expense', 35.00, 'acc-01', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('trans-03', '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Salário Mensal', 'cat-11', 'income', 5000.00, 'acc-01', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Orçamentos mensais
INSERT INTO "budgets" ("id", "user_id", "period", "year", "month", "category_id", "amount", "created_at", "updated_at") VALUES
('budget-01', '550e8400-e29b-41d4-a716-446655440000', 'monthly', 2025, 10, 'cat-01', 800.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('budget-02', '550e8400-e29b-41d4-a716-446655440000', 'monthly', 2025, 10, 'cat-02', 400.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('budget-03', '550e8400-e29b-41d4-a716-446655440000', 'monthly', 2025, 10, 'cat-03', 1500.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

COMMIT;
