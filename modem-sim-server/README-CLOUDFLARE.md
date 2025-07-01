# Configuration Cloudflare Tunnel pour CreditPro

Ce guide vous explique comment configurer Cloudflare Tunnel pour exposer votre `modem-sim-server` de manière sécurisée.

## ✅ Configuration Actuelle

Votre tunnel est configuré avec :
- **Tunnel ID** : `d125f0d7-6a20-456c-a171-1ef0c7facc67`
- **Hostname** : `modem-sim-server.creditpro-dz.com`
- **Service Local** : `ws://localhost:3001`

## Prérequis

1. **Compte Cloudflare** avec un domaine configuré ✅
2. **Tunnel créé** : Vous avez déjà créé le tunnel avec l'ID `d125f0d7-6a20-456c-a171-1ef0c7facc67` ✅
3. **cloudflared installé** sur votre machine ✅

## Vérification de la Configuration DNS

Dans le dashboard Cloudflare, vérifiez que vous avez :
1. **DNS** > **Records**
2. Un enregistrement CNAME :
   - **Name** : `modem-sim-server`
   - **Target** : `d125f0d7-6a20-456c-a171-1ef0c7facc67.cfargotunnel.com`
   - **Proxy status** : Proxied (orange cloud) ✅

## Démarrage du Tunnel

### Méthode 1 : Avec le fichier de configuration
```bash
cd modem-sim-server
cloudflared tunnel --config cloudflare-tunnel-config.yml run
```

### Méthode 2 : Commande directe
```bash
cloudflared tunnel --url ws://localhost:3001 d125f0d7-6a20-456c-a171-1ef0c7facc67
```

## Test de la Connexion

Une fois le tunnel démarré, vous devriez voir dans les logs :
```
2024-01-26T10:30:00Z INF Connection established location=CDG
2024-01-26T10:30:00Z INF Registered tunnel connection
2024-01-26T10:30:00Z INF Route propagated successfully
```

Testez la connexion WebSocket :
```bash
# Test avec wscat (npm install -g wscat)
wscat -c wss://modem-sim-server.creditpro-dz.com
```

## Configuration du Frontend

✅ **Le fichier `.env` est maintenant configuré avec votre domaine :**
```env
VITE_MODEM_SERVER_WS_URL=wss://modem-sim-server.creditpro-dz.com
```

## Étapes pour Résoudre le Problème

### 1. Vérifier que le serveur local fonctionne
```bash
cd modem-sim-server
npm run dev
```
Vous devriez voir : `SIM Manager Server listening on port 3001`

### 2. Démarrer le tunnel Cloudflare
```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml run
```

### 3. Tester la connexion
Ouvrez votre frontend et allez sur la page **SIMs & USSD**. Le statut devrait passer de "Serveur déconnecté" à "Serveur connecté".

## Dépannage

### Si la connexion échoue encore :

1. **Vérifiez les logs du tunnel** :
```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml --loglevel debug run
```

2. **Vérifiez que le DNS est propagé** :
```bash
nslookup modem-sim-server.creditpro-dz.com
```

3. **Testez la connexion directe** :
```bash
# Test local (doit fonctionner)
wscat -c ws://localhost:3001

# Test via tunnel (doit fonctionner après configuration)
wscat -c wss://modem-sim-server.creditpro-dz.com
```

### Logs à surveiller

**Serveur local** (port 3001) :
```
✅ SIM Manager Server listening on port 3001
✅ New WebSocket connection from [IP]
```

**Tunnel Cloudflare** :
```
✅ Connection established
✅ Registered tunnel connection
✅ Serving tunnel connector
```

**Frontend** :
```
✅ WebSocket connected to modem-sim-server
✅ Serveur connecté
```

## Commandes Utiles

```bash
# Voir les tunnels actifs
cloudflared tunnel list

# Voir les connexions actives
cloudflared tunnel info d125f0d7-6a20-456c-a171-1ef0c7facc67

# Nettoyer les connexions
cloudflared tunnel cleanup d125f0d7-6a20-456c-a171-1ef0c7facc67
```

Une fois ces étapes suivies, votre frontend devrait se connecter automatiquement au serveur via le tunnel Cloudflare ! 🚀