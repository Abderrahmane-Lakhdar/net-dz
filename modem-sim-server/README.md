# CreditPro SIM Manager Backend

Backend Node.js pour la gestion des modems GSM et communication USSD en temps réel.

## 🚀 Fonctionnalités

- **Détection automatique des modems GSM** via ports série
- **Communication USSD en temps réel** avec les opérateurs algériens
- **WebSocket API** pour communication bidirectionnelle avec le frontend
- **Intégration Supabase** pour persistance des données
- **Gestion multi-modems** avec load balancing
- **Monitoring en temps réel** des statuts et performances
- **Logs détaillés** et gestion d'erreurs robuste

## 📋 Prérequis

- Node.js 18+ 
- Modems GSM compatibles (Huawei, ZTE, Qualcomm, etc.)
- Cartes SIM des opérateurs algériens (Djezzy, Mobilis, Ooredoo)
- Accès à une base de données Supabase

## 🛠️ Installation

1. **Cloner et installer les dépendances**
```bash
cd modem-sim-server
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres Supabase
```

3. **Variables d'environnement requises**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=8080
NODE_ENV=development
```

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📡 API WebSocket

Le serveur expose une API WebSocket sur `ws://localhost:8080` pour la communication temps réel.

### Messages supportés

#### Lister les modems
```json
{
  "type": "getModems",
  "id": "unique-request-id"
}
```

#### Tester le solde
```json
{
  "type": "testBalance",
  "data": {
    "port": "COM3"
  },
  "id": "unique-request-id"
}
```

#### Envoyer un transfert
```json
{
  "type": "sendTransfer",
  "data": {
    "port": "COM3",
    "amount": 5000,
    "recipientPhone": "+213555123456",
    "transactionId": "optional-transaction-id"
  },
  "id": "unique-request-id"
}
```

#### Commande USSD personnalisée
```json
{
  "type": "sendUSSD",
  "data": {
    "port": "COM3",
    "ussdCode": "*555#"
  },
  "id": "unique-request-id"
}
```

#### Scanner les modems
```json
{
  "type": "scanModems",
  "id": "unique-request-id"
}
```

### Événements diffusés

#### Statut des modems
```json
{
  "type": "status",
  "data": {
    "type": "modems",
    "modems": [...]
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

#### Logs USSD
```json
{
  "type": "log",
  "data": {
    "type": "ussd",
    "log": {
      "port": "COM3",
      "response": {...},
      "timestamp": "2024-01-26T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-26T10:30:00.000Z"
}
```

## 🔧 Configuration des Modems

### Modems supportés
- **Huawei**: E3372, E8372, E3531, etc.
- **ZTE**: MF79U, MF823, MF831, etc.
- **Qualcomm**: Modems basés sur chipsets Qualcomm
- **Sierra Wireless**: EM/MC series
- **Telit**: HE/LE series

### Paramètres série
- **Baud Rate**: 115200
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None

## 📊 Monitoring et Logs

### Niveaux de logs
- `error`: Erreurs critiques
- `warn`: Avertissements
- `info`: Informations générales
- `debug`: Détails de débogage

### Fichiers de logs
- `logs/sim-manager.log`: Tous les logs
- `logs/error.log`: Erreurs uniquement

### Métriques surveillées
- Statut de connexion des modems
- Force du signal
- Statut des cartes SIM
- Temps de réponse USSD
- Taux de succès des transactions

## 🔒 Sécurité

- **Authentification**: Via clés Supabase
- **Validation**: Tous les paramètres d'entrée
- **Rate Limiting**: Protection contre le spam
- **Logs d'audit**: Traçabilité complète

## 🐛 Dépannage

### Problèmes courants

#### Modem non détecté
```bash
# Vérifier les ports disponibles
ls /dev/ttyUSB* # Linux
# ou
mode # Windows
```

#### Erreur de permission (Linux)
```bash
sudo usermod -a -G dialout $USER
# Redémarrer la session
```

#### Timeout USSD
- Vérifier la force du signal
- Vérifier le crédit de la SIM
- Augmenter le timeout dans la configuration

### Logs de débogage
```bash
LOG_LEVEL=debug npm run dev
```

## 🔄 Intégration avec le Frontend

Le frontend React communique avec ce backend via WebSocket pour:
- Affichage temps réel des modems
- Exécution des commandes USSD
- Réception des logs et statuts
- Gestion des transactions

## 📈 Performance

### Optimisations
- **Pool de connexions** pour les modems
- **Queue de commandes** pour éviter les conflits
- **Cache intelligent** pour les statuts
- **Reconnexion automatique** en cas de déconnexion

### Limites
- **Modems simultanés**: Jusqu'à 16 modems
- **Commandes/seconde**: ~10 par modem
- **Timeout USSD**: 30 secondes par défaut

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.