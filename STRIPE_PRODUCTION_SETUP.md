# 🚀 Guide de Configuration Stripe pour la Production

## Problème Identifié
Le message "Payment not available" apparaît dans la version déployée car les variables d'environnement Stripe ne sont pas configurées sur votre plateforme de déploiement.

## Variables Stripe Requises
Votre application nécessite ces 4 variables d'environnement :

```bash
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

## 📋 Configuration par Plateforme

### Vercel (Recommandé)

#### Méthode 1: Via CLI
```bash
# Naviguez vers votre projet
cd "David lakay AI2"

# Ajoutez chaque variable
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_PRICE_ID

# Redéployez
vercel --prod
```

#### Méthode 2: Via Dashboard Vercel
1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet "David-new"
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez chaque variable :
   - `STRIPE_SECRET_KEY` → `sk_live_51QGsq...` (votre clé secrète)
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_51QGsq...` (votre clé publique)
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (votre secret webhook)
   - `STRIPE_PRICE_ID` → `price_1Rlb...` (votre ID de prix)
5. **Important** : Cochez "Production" pour chaque variable
6. Cliquez sur **"Redeploy"** dans l'onglet Deployments

### Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Sélectionnez votre site
3. **Site settings** → **Environment variables**
4. Ajoutez les 4 variables Stripe
5. Redéployez le site

### Railway
1. Allez sur [railway.app](https://railway.app)
2. Sélectionnez votre projet
3. **Variables** tab
4. Ajoutez les variables Stripe
5. Railway redéploiera automatiquement

## 🧪 Vérification de la Configuration

### Test Local
```bash
npx tsx scripts/test-stripe-production.ts
```

### Test en Production
1. Allez sur votre site déployé
2. Naviguez vers la page de souscription
3. Vérifiez que le bouton "Subscribe" fonctionne
4. Vérifiez les logs de la console (F12) pour les erreurs

## 🔍 Debugging

### Vérifier les Variables en Production
Ajoutez temporairement cet endpoint pour debug :

```typescript
// src/app/api/debug/stripe/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPriceId: !!process.env.STRIPE_PRICE_ID,
    secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    publishableKeyPrefix: process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 7),
  };

  return NextResponse.json(config);
}
```

Puis visitez : `https://votre-site.vercel.app/api/debug/stripe`

### Messages d'Erreur Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Payment not available" | Variables manquantes | Configurer les variables d'environnement |
| "Stripe is not configured" | Configuration incomplète | Vérifier les 4 variables |
| "Failed to load payment system" | Clé publique invalide | Vérifier STRIPE_PUBLISHABLE_KEY |
| "Failed to create subscription" | Clé secrète ou Price ID invalide | Vérifier STRIPE_SECRET_KEY et STRIPE_PRICE_ID |

## ⚡ Solution Rapide

### Script Automatique pour Vercel
```bash
#!/bin/bash
# Remplacez par vos vraies valeurs
vercel env add STRIPE_SECRET_KEY production
# Entrez: sk_live_51QGsq...

vercel env add STRIPE_PUBLISHABLE_KEY production  
# Entrez: pk_live_51QGsq...

vercel env add STRIPE_WEBHOOK_SECRET production
# Entrez: whsec_...

vercel env add STRIPE_PRICE_ID production
# Entrez: price_1Rlb...

# Redéployez
vercel --prod
```

## 🎯 Étapes Suivantes

1. **Configurez les variables** sur votre plateforme de déploiement
2. **Redéployez** votre application
3. **Testez** les paiements sur le site en production
4. **Supprimez** l'endpoint de debug après vérification

## 📞 Support

Si le problème persiste après ces étapes :
1. Vérifiez les logs de déploiement
2. Testez l'endpoint `/api/stripe/config` en production
3. Vérifiez que vos clés Stripe sont actives dans le dashboard Stripe

---

**Note** : Assurez-vous d'utiliser des clés `live` (et non `test`) pour la production ! 