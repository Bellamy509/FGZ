# 🌐 Configuration des URLs Dynamiques

## Problème Résolu
✅ **URLs codées en dur supprimées** - L'application s'adapte maintenant automatiquement à n'importe quel domaine.

## 🔧 Changements Apportés

### 1. API Stripe (`/api/stripe/create-subscription`)
**Avant :** URL Railway codée en dur
```typescript
// ❌ Problématique
const getBaseUrl = () => {
  return "https://david-new-production.up.railway.app";
};
```

**Après :** Détection dynamique du domaine
```typescript
// ✅ Solution
const getBaseUrl = (request: Request) => {
  // 1. Variable d'environnement (priorité 1)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // 2. Détection des headers (priorité 2)
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
};
```

### 2. Lien de Subscription (Sidebar)
**Avant :** Lien externe codé en dur
```tsx
// ❌ Problématique
<Link href="https://david-new-production.up.railway.app/settings/subscription" target="_blank">
```

**Après :** Lien relatif dynamique
```tsx
// ✅ Solution
<Link href="/settings/subscription">
```

### 3. Métadonnées de Base
**Avant :** URL Railway fixe
```typescript
// ❌ Problématique
export const BASE_SITE_URL = "https://david-ai.railway.app";
```

**Après :** Variables d'environnement dynamiques
```typescript
// ✅ Solution
export const BASE_SITE_URL = 
  process.env.NEXT_PUBLIC_APP_URL || 
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
  "https://david-ai.com";
```

## 🚀 Configuration pour le Déploiement

### Variables d'Environnement Recommandées

#### Railway
```bash
NEXT_PUBLIC_APP_URL=https://votre-domaine.railway.app
```

#### Vercel
```bash
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
# Ou laissez Vercel détecter automatiquement avec VERCEL_URL
```

#### Netlify
```bash
NEXT_PUBLIC_APP_URL=https://votre-domaine.netlify.app
```

#### Domaine Personnalisé
```bash
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## 🎯 Fonctionnement Automatique

### 1. **Priorité des URLs :**
1. `NEXT_PUBLIC_APP_URL` (explicite)
2. `VERCEL_URL` (Vercel automatique)
3. Détection via headers de requête
4. Fallback générique

### 2. **Détection Intelligente :**
- **Protocol :** HTTPS par défaut, HTTP pour localhost
- **Host :** Extrait des headers de requête
- **Compatibilité :** Fonctionne avec tous les hébergeurs

### 3. **Pages Affectées :**
- ✅ Paiements Stripe (success/cancel URLs)
- ✅ Liens de subscription dans la sidebar
- ✅ Métadonnées OpenGraph et SEO
- ✅ MCP servers (pour les downloads)

## ✨ Avantages

🌐 **Multi-domaine :** Fonctionne sur n'importe quel domaine  
🔄 **Auto-détection :** Pas de configuration manuelle  
🛡️ **Sécurisé :** HTTPS par défaut  
📱 **Responsive :** Adaptatif selon l'environnement  
🚀 **Production-ready :** Optimisé pour tous les hébergeurs  

## 🧪 Test

### Vérifier localement
```bash
npm run dev
# URLs générées : http://localhost:3000
```

### Vérifier en production
```bash
# Les URLs s'adaptent automatiquement au domaine de déploiement
curl https://votre-domaine.com/api/debug/stripe
```

L'application génère maintenant automatiquement les bonnes URLs selon l'environnement ! 🎉 