-- 1. Habilitar Row Level Security (RLS) nas tabelas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. Remover acesso público (Anon) para evitar invasões e vazamento de senhas
-- Ao não criar políticas para a role 'anon', negamos todo o acesso por padrão.
-- Apenas o backend usando a chave SUPABASE_SERVICE_ROLE_KEY poderá acessar.
