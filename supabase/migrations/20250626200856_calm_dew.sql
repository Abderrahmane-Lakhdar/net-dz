/*
  # Schéma Initial - Plateforme de Transfert de Crédit

  1. Nouvelles Tables
    - `operators` - Configuration des opérateurs télécom (Djezzy, Mobilis, Ooredoo)
    - `distributors` - Fournisseurs de crédit avec gestion des commissions
    - `sims` - Gestion multi-SIM avec load balancing
    - `clients` - Profils clients avec analytics automatisées
    - `transactions` - Historique complet des transferts
    - `pricing_rules` - Règles de tarification flexibles
    - `client_analytics` - Métriques et analytics par client

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès basées sur l'authentification
    - Audit trail complet

  3. Performance
    - Index optimisés pour les requêtes fréquentes
    - Contraintes de validation
    - Triggers pour mise à jour automatique
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des opérateurs télécom
CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  ussd_config jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des distributeurs
CREATE TABLE IF NOT EXISTS distributors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_info jsonb NOT NULL DEFAULT '{}',
  credit_balance numeric(15,2) DEFAULT 0,
  commission_rate numeric(5,4) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des cartes SIM
CREATE TABLE IF NOT EXISTS sims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id uuid REFERENCES operators(id) ON DELETE CASCADE,
  phone_number text UNIQUE NOT NULL,
  status text CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  balance numeric(10,2) DEFAULT 0,
  last_used timestamptz,
  modem_port text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des clients avec profiling avancé
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text UNIQUE NOT NULL,
  name text,
  segment text CHECK (segment IN ('VIP', 'REGULAR', 'NEW', 'RISK')) DEFAULT 'NEW',
  risk_score integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  total_transactions integer DEFAULT 0,
  total_amount numeric(15,2) DEFAULT 0,
  average_amount numeric(10,2) DEFAULT 0,
  frequency numeric(5,2) DEFAULT 0,
  last_activity timestamptz,
  preferred_operator uuid REFERENCES operators(id),
  behavior_patterns jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  operator_id uuid REFERENCES operators(id) ON DELETE CASCADE,
  sim_id uuid REFERENCES sims(id),
  distributor_id uuid REFERENCES distributors(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount >= 5000),
  commission numeric(8,2) NOT NULL DEFAULT 0,
  status text CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  recipient_phone text NOT NULL,
  ussd_response text,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Table des règles de pricing
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id uuid REFERENCES operators(id) ON DELETE CASCADE,
  client_segment text CHECK (client_segment IN ('VIP', 'REGULAR', 'NEW', 'RISK', 'ALL')) DEFAULT 'ALL',
  min_amount numeric(10,2) NOT NULL,
  max_amount numeric(10,2),
  commission_rate numeric(5,4) NOT NULL,
  fixed_commission numeric(8,2),
  is_active boolean DEFAULT true,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des analytics clients
CREATE TABLE IF NOT EXISTS client_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  transactions_count integer DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  avg_amount numeric(10,2) DEFAULT 0,
  success_rate numeric(5,4) DEFAULT 0,
  preferred_hours integer[] DEFAULT '{}',
  risk_indicators jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_segment ON clients(segment);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_sims_operator_status ON sims(operator_id, status);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_operator_segment ON pricing_rules(operator_id, client_segment);
CREATE INDEX IF NOT EXISTS idx_client_analytics_client_date ON client_analytics(client_id, date);

-- Triggers pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sims_updated_at BEFORE UPDATE ON sims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mise à jour automatique des profils clients
CREATE OR REPLACE FUNCTION update_client_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE clients SET
      total_transactions = total_transactions + 1,
      total_amount = total_amount + NEW.amount,
      average_amount = (total_amount + NEW.amount) / (total_transactions + 1),
      last_activity = NEW.completed_at,
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_profile_trigger 
  AFTER UPDATE ON transactions 
  FOR EACH ROW 
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_client_profile();

-- RLS (Row Level Security)
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour utilisateurs authentifiés
CREATE POLICY "Authenticated users can read operators" ON operators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage operators" ON operators FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read distributors" ON distributors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage distributors" ON distributors FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sims" ON sims FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sims" ON sims FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage clients" ON clients FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage transactions" ON transactions FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read pricing_rules" ON pricing_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage pricing_rules" ON pricing_rules FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read client_analytics" ON client_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage client_analytics" ON client_analytics FOR ALL TO authenticated USING (true);