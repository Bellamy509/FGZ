# Système de Crédits - Guide de Résolution

## Problème Identifié

L'erreur "Insufficient credits. Please upgrade to continue using the service." avec `remainingCredits: 0` était causée par le fait que les crédits gratuits n'étaient pas automatiquement distribués aux nouveaux utilisateurs lors de l'inscription.

## Cause Racine

1. **Hook manquant** : La fonction `onUserCreated` existait mais n'était pas connectée au système d'authentification
2. **Pas d'attribution automatique** : Aucun mécanisme pour distribuer les crédits lors de l'inscription
3. **Utilisateurs existants** : Les utilisateurs déjà inscrits n'avaient pas de crédits

## Solution Implémentée

### 1. Configuration du Hook d'Authentification

**Fichier modifié** : `src/lib/auth/server.ts`

Ajouté un hook `after` qui se déclenche lors de l'inscription :

```typescript
hooks: {
  after: [
    {
      matcher(context) {
        return context.path === "/sign-up/email" && context.method === "POST";
      },
      handler: async (ctx) => {
        if (ctx.body?.user?.id) {
          try {
            await onUserCreated(ctx.body.user.id);
            logger.info(`✅ Free credits granted to user: ${ctx.body.user.id}`);
          } catch (error) {
            logger.error(`❌ Failed to grant free credits to user: ${ctx.body.user.id}`, error);
          }
        }
      }
    }
  ]
}
```

### 2. Amélioration de la Fonction d'Attribution

**Fichier modifié** : `src/app/api/auth/actions.ts`

- Ajout de vérifications pour éviter les doublons
- Meilleure gestion d'erreurs
- Logging détaillé
- Fonctions utilitaires pour la maintenance

### 3. Scripts de Maintenance

#### Script d'Initialisation Amélioré
**Fichier modifié** : `scripts/init-free-credits.ts`

- Utilise maintenant `STRIPE_PLANS.FREE.credits` (300 crédits) de manière cohérente
- Statistiques détaillées
- Meilleure gestion d'erreurs

#### Nouveau Script de Test
**Fichier créé** : `scripts/test-credits-system.ts`

Permet de diagnostiquer l'état du système de crédits :
- Vérifie la configuration
- Compte les utilisateurs avec/sans crédits
- Identifie les problèmes

### 4. API de Maintenance

**Fichier créé** : `src/app/api/user/credits/route.ts`

- `GET /api/user/credits` : Vérifie et attribue des crédits à l'utilisateur connecté
- `POST /api/user/credits` : (Admin) Initialise les crédits pour tous les utilisateurs

## Configuration des Crédits

```typescript
// src/lib/stripe/config.ts
export const STRIPE_PLANS = {
  FREE: {
    name: "Free Plan",
    credits: 300,  // 300 crédits gratuits par utilisateur
    price: 0,
  },
  PRO: {
    name: "Pro Plan",
    price: 15,
    priceId: STRIPE_CONFIG.priceId,
  },
}
```

## Commandes Disponibles

### Pour les Utilisateurs Existants
```bash
# Distribuer des crédits aux utilisateurs existants qui n'en ont pas
pnpm init:credits

# Tester l'état du système de crédits
pnpm test:credits
```

### Pour le Débogage
```bash
# Vérifier la base de données
pnpm db:studio

# Voir les logs de l'application
pnpm dev
```

## Vérification du Fix

1. **Nouveaux utilisateurs** : Les crédits sont automatiquement attribués lors de l'inscription
2. **Utilisateurs existants** : Utiliser `pnpm init:credits` pour distribuer les crédits
3. **Test manuel** : Appeler `GET /api/user/credits` pour vérifier/corriger les crédits d'un utilisateur

## Structure de la Base de Données

Table `user_credits` :
```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user(id),
  credits INTEGER NOT NULL DEFAULT 0,
  is_initial_credit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Prochaines Étapes

1. **Monitoring** : Surveiller les logs pour s'assurer que les nouveaux utilisateurs reçoivent leurs crédits
2. **Tests** : Tester l'inscription de nouveaux utilisateurs
3. **Maintenance** : Exécuter périodiquement `pnpm test:credits` pour vérifier l'intégrité du système

## Variables d'Environnement

Pour utiliser l'API admin d'initialisation de crédits :
```env
# Optionnel : emails d'administrateurs séparés par des virgules
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

## Résolution des Problèmes

### Si l'erreur persiste :

1. Vérifier que la base de données est accessible
2. Exécuter `pnpm test:credits` pour diagnostiquer
3. Si nécessaire, exécuter `pnpm init:credits`
4. Vérifier les logs de l'application

### Erreur de migration :
```bash
pnpm db:migrate
```

### Réinitialisation complète (attention, efface les données) :
```bash
pnpm db:reset
pnpm db:migrate
pnpm init:credits
``` 