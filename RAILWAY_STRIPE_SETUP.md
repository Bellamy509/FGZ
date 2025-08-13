# 🚂 Configuration Stripe pour Railway

## Solution Rapide

### Méthode 1: Script Automatique (Recommandé)
```bash
# Exécuter le script automatique
./scripts/deploy-stripe-to-railway.sh
```

### Méthode 2: Railway CLI Manuel
```bash
# Installer Railway CLI si nécessaire
npm i -g @railway/cli

# Se connecter à Railway
railway login

# Lier votre projet (si pas déjà fait)
railway link

# Ajouter les variables Stripe
railway variables set STRIPE_SECRET_KEY=sk_live_51QGsq...
railway variables set STRIPE_PUBLISHABLE_KEY=pk_live_51QGsq...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set STRIPE_PRICE_ID=price_1Rlb...
```

### Méthode 3: Interface Web Railway
1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet "David-new"
3. Cliquez sur l'onglet **"Variables"**
4. Ajoutez chaque variable :
   ```
   STRIPE_SECRET_KEY = sk_live_51QGsq...
   STRIPE_PUBLISHABLE_KEY = pk_live_51QGsq...
   STRIPE_WEBHOOK_SECRET = whsec_...
   STRIPE_PRICE_ID = price_1Rlb...
   ```
5. Railway redéploiera automatiquement

## Vérification

### 1. Vérifier que les variables sont définies
```bash
railway variables
```

### 2. Tester l'endpoint de debug
Visitez : `https://votre-app.railway.app/api/debug/stripe`

### 3. Vérifier les logs de déploiement
```bash
railway logs
```

## Avantages de Railway

✅ **Redéploiement automatique** quand vous ajoutez des variables  
✅ **Configuration simple** via CLI ou interface web  
✅ **Logs en temps réel** pour debugging  
✅ **Environnement de production** automatiquement configuré  

## Troubleshooting Railway

### Variables pas prises en compte
```bash
# Forcer un redéploiement
railway up --detach
```

### Vérifier le statut du déploiement
```bash
railway status
```

### Voir les logs d'erreur
```bash
railway logs --tail
```

## URL de votre application
Après déploiement, votre app sera disponible à :
- `https://[project-name].railway.app`
- URL personnalisée si configurée

## Test Final
1. Allez sur votre site Railway
2. Naviguez vers la page de subscription  
3. Cliquez sur "Subscribe" - ça devrait fonctionner !

---

**Note** : Railway détecte automatiquement les changements de variables et redéploie votre application. Patience pendant 2-3 minutes pour la prise en compte. 