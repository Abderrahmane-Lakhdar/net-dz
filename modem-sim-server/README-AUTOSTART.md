# Configuration du Démarrage Automatique - CreditPro

Ce guide vous explique comment configurer le démarrage automatique du serveur modem-sim-server et du tunnel Cloudflare.

## 🚀 Méthodes de Configuration

### Méthode 1: Scripts de Démarrage Simples (Recommandée)

1. **Tester manuellement d'abord:**
```bash
# Dans le dossier modem-sim-server
scripts\start-all.bat
```

2. **Créer les tâches automatiques:**
```powershell
# Ouvrir PowerShell en tant qu'Administrateur
cd modem-sim-server\scripts
.\create-startup-task.ps1
```

### Méthode 2: Service Windows avec NSSM

1. **Installer NSSM:**
   - Télécharger depuis: https://nssm.cc/download
   - Extraire dans un dossier (ex: C:\nssm)
   - Ajouter au PATH Windows

2. **Installer les services:**
```bash
# Exécuter en tant qu'Administrateur
scripts\install-as-service.bat
```

3. **Démarrer les services:**
```bash
net start CreditPro-ModemServer
net start CreditPro-Tunnel
```

### Méthode 3: Planificateur de Tâches Manuel

1. Ouvrir le Planificateur de tâches (`taskschd.msc`)
2. Créer une tâche de base
3. **Nom:** CreditPro System
4. **Déclencheur:** Au démarrage de l'ordinateur
5. **Action:** Démarrer un programme
6. **Programme:** `C:\chemin\vers\modem-sim-server\scripts\start-all.bat`
7. **Paramètres avancés:**
   - ✅ Exécuter avec les privilèges les plus élevés
   - ✅ Exécuter même si l'utilisateur n'est pas connecté

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `start-modem-server.bat` | Démarre uniquement le serveur Node.js |
| `start-tunnel.bat` | Démarre uniquement le tunnel Cloudflare |
| `start-all.bat` | Démarre les deux services |
| `check-status.bat` | Vérifie l'état des services |
| `create-startup-task.ps1` | Crée les tâches automatiques |
| `remove-startup-tasks.ps1` | Supprime les tâches automatiques |

## 📋 Prérequis

### Logiciels Requis
- ✅ Node.js (v18+)
- ✅ cloudflared
- ✅ Fichier de credentials Cloudflare

### Vérifications
```bash
# Vérifier Node.js
node --version

# Vérifier cloudflared
cloudflared --version

# Vérifier le fichier de credentials
dir "C:\Users\Administrateur\.cloudflared\2d029445-340a-40ea-80b0-035f4f8b2e2f.json"
```

## 🔍 Diagnostic et Dépannage

### Vérifier l'État du Système
```bash
scripts\check-status.bat
```

### Logs et Monitoring
- **Logs du serveur:** Visibles dans la fenêtre CMD du serveur
- **Logs du tunnel:** Visibles dans la fenêtre CMD du tunnel
- **Logs des tâches:** Planificateur de tâches > Historique

### Problèmes Courants

#### 1. Serveur ne démarre pas
```bash
# Vérifier les dépendances
cd modem-sim-server
npm install

# Tester manuellement
npm run dev
```

#### 2. Tunnel ne se connecte pas
```bash
# Vérifier la configuration
cloudflared tunnel --config cloudflare-tunnel-config.yml info

# Tester la connexion
cloudflared tunnel --config cloudflare-tunnel-config.yml run
```

#### 3. Permissions insuffisantes
- Exécuter PowerShell en tant qu'Administrateur
- Vérifier les droits d'accès aux fichiers

## 🔄 Gestion des Services

### Démarrer manuellement
```bash
# Via scripts
scripts\start-all.bat

# Via tâches planifiées
schtasks /run /tn "CreditPro-ModemServer"
schtasks /run /tn "CreditPro-CloudflareTunnel"
```

### Arrêter les services
```bash
# Fermer les fenêtres CMD ou Ctrl+C

# Via tâches planifiées
schtasks /end /tn "CreditPro-ModemServer"
schtasks /end /tn "CreditPro-CloudflareTunnel"
```

### Supprimer les tâches automatiques
```powershell
# PowerShell en tant qu'Administrateur
scripts\remove-startup-tasks.ps1
```

## ✅ Test de Validation

1. **Redémarrer l'ordinateur**
2. **Attendre 1-2 minutes**
3. **Exécuter le test:**
```bash
scripts\check-status.bat
```

4. **Tester la connexion WebSocket:**
```bash
wscat -c wss://modem-sim-server.creditpro-dz.com
```

5. **Vérifier dans le frontend CreditPro:**
   - Aller sur la page "SIMs & USSD"
   - Vérifier que le statut affiche "Connecté via tunnel Cloudflare"

## 🚨 Sécurité et Bonnes Pratiques

- ✅ Exécuter avec les privilèges minimum nécessaires
- ✅ Surveiller les logs régulièrement
- ✅ Mettre à jour cloudflared régulièrement
- ✅ Sauvegarder la configuration du tunnel
- ✅ Tester après chaque redémarrage système

## 📞 Support

Si vous rencontrez des problèmes:
1. Exécuter `scripts\check-status.bat`
2. Vérifier les logs dans les fenêtres CMD
3. Tester la connexion WebSocket manuellement
4. Vérifier la configuration DNS dans Cloudflare