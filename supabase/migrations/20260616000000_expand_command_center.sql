-- 1. Enriquecer la tabla tenants con campos comerciales (CRM)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'active_customer' CHECK (lead_status IN ('lead', 'contacted', 'trial', 'active_customer', 'churned')),
ADD COLUMN IF NOT EXISTS sales_notes TEXT,
ADD COLUMN IF NOT EXISTS next_followup_date DATE,
ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(10,2) DEFAULT 0.0;

-- 2. Crear tabla provider_subscriptions
CREATE TABLE IF NOT EXISTS public.provider_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_key_masked TEXT,
  cost_this_month NUMERIC(10,2) DEFAULT 0.00,
  spending_limit NUMERIC(10,2) DEFAULT 0.00,
  billing_cycle_start DATE,
  billing_cycle_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'warning', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.provider_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage provider subscriptions"
ON public.provider_subscriptions
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 3. Crear tabla finance_transactions
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage finance transactions"
ON public.finance_transactions
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 4. Crear tabla channel_errors
CREATE TABLE IF NOT EXISTS public.channel_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  error_message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.channel_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage channel errors"
ON public.channel_errors
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 5. Insertar datos de prueba
INSERT INTO public.provider_subscriptions (name, api_key_masked, cost_this_month, spending_limit, billing_cycle_start, billing_cycle_end, status) VALUES
  ('OpenAI API', 'sk-proj-...X8aB', 145.20, 500.00, NOW()::DATE - 15, NOW()::DATE + 15, 'active'),
  ('Anthropic API', 'sk-ant-...9k1a', 320.50, 400.00, NOW()::DATE - 15, NOW()::DATE + 15, 'warning'),
  ('Gemini Flash API', 'AIzaSy...7x9a', 45.10, 200.00, NOW()::DATE - 10, NOW()::DATE + 20, 'active'),
  ('Meta Graph (WhatsApp)', 'EAAGz...8b2c', 12.00, 100.00, NOW()::DATE - 5, NOW()::DATE + 25, 'active');

INSERT INTO public.channel_errors (tenant_id, channel, error_message, severity, resolved)
SELECT id, 'whatsapp', 'Meta API Rate Limit Exceeded (Error 429)', 'critical', FALSE
FROM public.tenants LIMIT 1;

INSERT INTO public.channel_errors (tenant_id, channel, error_message, severity, resolved)
SELECT id, 'web_widget', 'Connection timeout while loading RAG document id: 45', 'warning', FALSE
FROM public.tenants LIMIT 1;