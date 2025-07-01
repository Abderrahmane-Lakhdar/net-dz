/*
  # Données Initiales - Opérateurs Algériens

  1. Opérateurs
    - Djezzy avec configuration USSD
    - Mobilis avec configuration USSD  
    - Ooredoo avec configuration USSD

  2. Distributeurs
    - Distributeur principal avec taux de commission

  3. Règles de Pricing
    - Taux de base par opérateur
    - Taux préférentiels pour clients VIP
*/

-- Insertion des opérateurs algériens
INSERT INTO operators (name, code, ussd_config, is_active) VALUES
(
  'Djezzy',
  'DJZ',
  '{
    "transfer_code": "*555*{amount}*{phone}#",
    "balance_check": "*555#",
    "timeout": 30,
    "retry_attempts": 3,
    "success_patterns": ["transfert effectue", "recharge reussie"],
    "error_patterns": ["solde insuffisant", "numero invalide", "erreur"]
  }',
  true
),
(
  'Mobilis',
  'MOB',
  '{
    "transfer_code": "*606*{amount}*{phone}#",
    "balance_check": "*606#",
    "timeout": 30,
    "retry_attempts": 3,
    "success_patterns": ["transfert reussi", "credit envoye"],
    "error_patterns": ["solde insuffisant", "numero incorrect", "echec"]
  }',
  true
),
(
  'Ooredoo',
  'OOR',
  '{
    "transfer_code": "*100*{amount}*{phone}#",
    "balance_check": "*100#",
    "timeout": 30,
    "retry_attempts": 3,
    "success_patterns": ["transfert confirme", "recharge effectuee"],
    "error_patterns": ["credit insuffisant", "numero non valide", "erreur systeme"]
  }',
  true
);

-- Insertion d'un distributeur principal
INSERT INTO distributors (name, contact_info, credit_balance, commission_rate, is_active) VALUES
(
  'Distributeur Principal',
  '{
    "phone": "+213555123456",
    "email": "contact@distributeur.dz",
    "address": "Alger, Algérie"
  }',
  1000000.00,
  0.0250,
  true
);

-- Récupération des IDs pour les règles de pricing
DO $$
DECLARE
  djezzy_id uuid;
  mobilis_id uuid;
  ooredoo_id uuid;
BEGIN
  SELECT id INTO djezzy_id FROM operators WHERE code = 'DJZ';
  SELECT id INTO mobilis_id FROM operators WHERE code = 'MOB';
  SELECT id INTO ooredoo_id FROM operators WHERE code = 'OOR';

  -- Règles de pricing pour Djezzy
  INSERT INTO pricing_rules (operator_id, client_segment, min_amount, max_amount, commission_rate, fixed_commission, is_active) VALUES
  (djezzy_id, 'VIP', 5000, 50000, 0.0200, NULL, true),
  (djezzy_id, 'REGULAR', 5000, 20000, 0.0250, NULL, true),
  (djezzy_id, 'NEW', 5000, 10000, 0.0300, NULL, true),
  (djezzy_id, 'RISK', 5000, 5000, 0.0350, NULL, true);

  -- Règles de pricing pour Mobilis
  INSERT INTO pricing_rules (operator_id, client_segment, min_amount, max_amount, commission_rate, fixed_commission, is_active) VALUES
  (mobilis_id, 'VIP', 5000, 50000, 0.0220, NULL, true),
  (mobilis_id, 'REGULAR', 5000, 20000, 0.0270, NULL, true),
  (mobilis_id, 'NEW', 5000, 10000, 0.0320, NULL, true),
  (mobilis_id, 'RISK', 5000, 5000, 0.0370, NULL, true);

  -- Règles de pricing pour Ooredoo
  INSERT INTO pricing_rules (operator_id, client_segment, min_amount, max_amount, commission_rate, fixed_commission, is_active) VALUES
  (ooredoo_id, 'VIP', 5000, 50000, 0.0210, NULL, true),
  (ooredoo_id, 'REGULAR', 5000, 20000, 0.0260, NULL, true),
  (ooredoo_id, 'NEW', 5000, 10000, 0.0310, NULL, true),
  (ooredoo_id, 'RISK', 5000, 5000, 0.0360, NULL, true);
END $$;