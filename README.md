# CreditPro - Plateforme de Transfert de Crédit Avancée

Une plateforme sophistiquée de transfert de crédit pour l'Algérie avec analytics temps réel, gestion multi-SIM et pricing intelligent.

## 🚀 Fonctionnalités Principales

### Phase 1 - Infrastructure & Base de Données ✅
- ✅ Configuration Supabase avec schéma complet
- ✅ Tables optimisées (opérateurs, distributeurs, clients, transactions, pricing_rules, analytics)
- ✅ Système d'authentification sécurisé
- ✅ Interface utilisateur moderne avec thème jour/nuit
- ✅ Dashboard avec analytics temps réel

### Phase 2 - Système de Transfert & Clients ✅
- ✅ Module de transfert avec validation 5000 DZD minimum
- ✅ Gestion des clients avec profiling automatisé
- ✅ Interface de création de transferts en temps réel
- ✅ Système de segmentation client (VIP, REGULAR, NEW, RISK)
- ✅ Calcul automatique des commissions selon les règles de pricing
- ✅ Simulation de traitement USSD avec statuts temps réel
- ✅ Profils clients détaillés avec analytics comportementales

### Phase 3 - En Développement 🚧
- 🚧 Configuration USSD dynamique par opérateur
- 🚧 Communication SIM & USSD réelle
- 🚧 Analytics & Intelligence Client avancées
- 🚧 Système de monitoring et alertes

### Phase 4 - Planifié 📋
- 📋 Application Mobile (expo)
- 📋 API REST complète
- 📋 Tests automatisés & Déploiement
- 📋 Intégrations tierces

## 🏗️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Framer Motion** pour les animations
- **Recharts** pour les graphiques
- **React Router** pour la navigation

### Backend
- **Supabase** (PostgreSQL + Edge Functions)
- **Row Level Security** pour la sécurité
- **Real-time subscriptions** pour les mises à jour live

### Base de Données
- **PostgreSQL** avec extensions avancées
- **Triggers** pour mise à jour automatique
- **Index optimisés** pour les performances
- **Analytics automatisées** par client

## 🎨 Design System

### Thèmes
- **Mode Jour** : Interface claire et moderne
- **Mode Nuit** : Interface sombre optimisée (par défaut)

### Couleurs
- **Primary** : Bleu (#3b82f6) - Actions principales
- **Secondary** : Vert (#22c55e) - Succès et confirmations
- **Accent** : Rouge (#ef4444) - Alertes et erreurs
- **Dark** : Gris foncé - Interface nuit

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd credit-transfer-platform
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
- Créer un projet Supabase
- Copier `.env.example` vers `.env`
- Configurer les variables d'environnement

4. **Lancer le développement**
```bash
npm run dev
```

## 📊 Fonctionnalités Phase 2

### Module de Transfert
- **Validation automatique** : Montant minimum 5000 DZD
- **Validation téléphone** : Format algérien (+213XXXXXXXXX)
- **Gestion des clients** : Création automatique si inexistant
- **Calcul commission** : Basé sur les règles de pricing et segment client
- **Statuts temps réel** : pending → processing → completed/failed
- **Simulation USSD** : Traitement asynchrone avec délais réalistes

### Gestion des Clients
- **Profiling automatique** : Mise à jour des métriques à chaque transaction
- **Segmentation intelligente** : NEW, REGULAR, VIP, RISK
- **Score de risque** : Calcul basé sur les patterns comportementaux
- **Analytics détaillées** : Volume, fréquence, montants moyens
- **Historique complet** : Toutes les transactions par client

### Interface Utilisateur
- **Design responsive** : Optimisé mobile et desktop
- **Animations fluides** : Transitions et micro-interactions
- **Filtres avancés** : Recherche et tri par multiple critères
- **Modales interactives** : Création et détails en overlay
- **Notifications temps réel** : Toast et mises à jour live

## 📊 Opérateurs Supportés

### Djezzy
- Code USSD : `*555*{amount}*{phone}#`
- Vérification solde : `*555#`
- Taux commission : 2.0% - 3.5%

### Mobilis
- Code USSD : `*606*{amount}*{phone}#`
- Vérification solde : `*606#`
- Taux commission : 2.2% - 3.7%

### Ooredoo
- Code USSD : `*100*{amount}*{phone}#`
- Vérification solde : `*100#`
- Taux commission : 2.1% - 3.6%

## 🔐 Sécurité

- **Authentification** par email/mot de passe
- **Row Level Security** sur toutes les tables
- **Validation** montant minimum 5000 DZD
- **Audit trail** complet des transactions
- **Chiffrement** des données sensibles

## 📈 Analytics

### Métriques Clients
- Profiling automatique par transaction
- Scoring de risque (0-100)
- Segmentation dynamique (VIP, REGULAR, NEW, RISK)
- Patterns comportementaux

### Métriques Business
- Volume de transactions temps réel
- Revenus par opérateur
- Taux de réussite
- Performance des SIMs

## 🛠️ Développement

### Structure du Projet
```
src/
├── components/     # Composants réutilisables
├── contexts/       # Contextes React (Auth, Theme)
├── lib/           # Utilitaires et configuration
├── pages/         # Pages de l'application
├── types/         # Types TypeScript
└── hooks/         # Hooks personnalisés
```

### Scripts Disponibles
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu du build
- `npm run lint` - Vérification du code

## 📱 Roadmap Mobile

### Capacitor Integration
- Configuration iOS/Android
- Authentification biométrique
- Notifications push
- Mode offline

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : support@creditpro.dz
- Documentation : [docs.creditpro.dz](https://docs.creditpro.dz)

---

**CreditPro** - Révolutionner le transfert de crédit en Algérie 🇩🇿