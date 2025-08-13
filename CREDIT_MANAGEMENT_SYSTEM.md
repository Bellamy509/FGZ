# 💳 Système de Gestion des Crédits et Alertes d'Upgrade

## ✅ Fonctionnalités Implémentées

### **🔍 Hook de Gestion des Crédits (`useCredits`)**
```typescript
const { 
  credits,                    // Nombre de crédits disponibles
  hasCredits,                 // Boolean: a des crédits
  isLowCredits,              // Boolean: crédits faibles (≤10)
  checkCreditsForAction,     // Fonction de vérification avant action
  showUpgradeAlert,          // Affichage d'alerte contextualisée
  refreshCredits             // Actualisation des crédits
} = useCredits();
```

### **🚨 Alertes d'Upgrade Automatiques**

#### **📍 Emplacements :**
- ✅ **Page principale** (`/chat`) - Avant les messages
- ✅ **Page MCP** (`/mcp`) - Après le header
- ✅ **Toasts contextuels** - Lors des actions bloquées

#### **🎯 Types d'Alertes :**
- **Crédits épuisés** : Alerte rouge avec bouton "Upgrade to Pro"
- **Crédits faibles** : Avertissement jaune avec bouton "Upgrade Now"
- **Alertes contextuelles** : Messages spécifiques par fonctionnalité

### **🚫 Désactivation des Fonctionnalités Coûteuses**

#### **🎤 Voix (Transcription)**
- **Vérification** : Avant chaque enregistrement
- **Coût** : 1 crédit par transcription
- **Comportement** :
  - Bouton microphone désactivé sans crédits
  - Tooltip informatif : "No credits for voice transcription"
  - Alerte contextuelle si tentative d'utilisation

#### **📎 Upload de Fichiers**
- **Vérification** : Avant chaque upload
- **Coût** : 10 crédits par fichier
- **Comportement** :
  - Bouton trombone désactivé sans crédits
  - Tooltip informatif : "No credits for file uploads (10 credits per file)"
  - Vérification du total de crédits nécessaires pour plusieurs fichiers
  - Nettoyage automatique du sélecteur de fichiers si refusé

#### **💬 Chat**
- **Vérification** : Au niveau API (backend)
- **Coût** : Variable selon les tokens utilisés
- **Comportement** :
  - Erreur HTTP 402 si crédits insuffisants
  - Message d'erreur avec bouton d'upgrade dans le toast

### **📱 Interface Utilisateur**

#### **🎨 Composant `UpgradeAlert`**
```typescript
<UpgradeAlert 
  context="chat|mcp|general" 
  showWhenLowCredits={true}
/>
```

#### **💡 Caractéristiques :**
- **Responsive** : S'adapte à tous les contextes
- **Contextuel** : Messages spécifiques selon l'usage
- **Actionnable** : Boutons directs vers `/settings/subscription`
- **Intelligent** : Ne s'affiche que quand nécessaire

### **🔄 Gestion en Temps Réel**

#### **📊 Actualisation Automatique :**
- **Intervalle** : Toutes les 30 secondes
- **Triggers** : 
  - Focus sur la fenêtre
  - Reconnexion réseau
  - Après chaque action coûteuse (chat, voice, upload)

#### **🎯 Feedback Immédiat :**
- **Succès** : Toast vert avec crédits restants
- **Erreur** : Toast rouge avec bouton d'upgrade
- **Avertissement** : Toast orange pour crédits faibles

## 🧪 Comportements par Scénario

### **Crédits Suffisants (>10)**
- ✅ Toutes les fonctionnalités disponibles
- ✅ Aucune alerte visible
- ✅ Interface normale

### **Crédits Faibles (1-10)**
- ⚠️ Alerte jaune d'avertissement
- ✅ Fonctionnalités encore disponibles
- 💡 Suggestion d'upgrade préventive

### **Crédits Épuisés (0)**
- 🚨 Alerte rouge prominente
- 🚫 Boutons voix et upload désactivés
- 🛑 Chat bloqué au niveau API
- 📞 Appels à l'action pour upgrade

## 🔧 Configuration Technique

### **Coûts par Fonctionnalité :**
- **Chat** : ~1 crédit per 1000 tokens
- **Transcription vocale** : 1 crédit par audio
- **Upload de fichier** : 10 crédits par fichier

### **Seuils d'Alerte :**
- **Crédits faibles** : ≤ 10 crédits
- **Crédits épuisés** : 0 crédits

### **APIs Protégées :**
- `/api/chat` - Chat principal
- `/api/mcp-chat/chat` - Chat MCP
- `/api/mcp/chat` - Chat MCP simple  
- `/api/chat/files/upload` - Upload principal
- `/api/mcp-chat/files/upload` - Upload MCP
- `/api/mcp-chat/transcribe` - Transcription vocale

## 🎯 Expérience Utilisateur Optimisée

### **🤝 Guidage Proactif :**
- Messages clairs et informatifs
- Boutons d'action directs
- Contexte spécifique à chaque fonctionnalité

### **🚀 Conversion Optimisée :**
- Alertes non-intrusives quand approprié
- Boutons d'upgrade prominents quand nécessaire
- Navigation directe vers la page de souscription

### **💡 Transparence Totale :**
- Coûts clairement indiqués dans les tooltips
- Compteurs de crédits en temps réel
- Feedback immédiat après chaque action

Le système encourage naturellement l'upgrade tout en maintenant une expérience utilisateur fluide et transparente ! 🎉 