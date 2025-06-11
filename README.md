# 📮 MailManager - Application de Gestion de Courrier Familial

Une application web moderne pour gérer le courrier papier de votre famille, développée avec React, TypeScript et Tailwind CSS.

![MailManager Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=MailManager+Dashboard)

## ✨ Fonctionnalités

### 🔐 **Authentification**
- Inscription et connexion sécurisées
- Gestion des sessions utilisateur
- Interface multilingue (FR/EN)

### 📊 **Tableau de bord**
- Vue d'ensemble des statistiques
- Courriers récents
- Indicateurs visuels (en attente, traités, en retard)
- Graphiques et métriques

### 📬 **Gestion du courrier**
- Ajout/modification de courriers
- Types : factures, lettres, administratif, banque, assurance, etc.
- Statuts : en attente, en cours, traité, archivé
- Upload de pièces jointes (PDF, images, documents)
- Dates limites et actions requises

### 🔍 **Recherche et filtres**
- Recherche globale dans tous les champs
- Filtres par type, statut, expéditeur, destinataire
- Filtres par dates
- Résultats en temps réel

### 📤 **Export**
- Export PDF avec mise en forme
- Export CSV pour analyse
- Aperçu des données avant export

### 🔔 **Notifications**
- Rappels pour les courriers en retard
- Interface dédiée (en développement)

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd mail-management-app
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration
Créez un fichier `.env.local` à la racine :
```env
# URL de l'API Symfony (optionnel, par défaut utilise des données mock)
VITE_API_URL=http://localhost:8000/api

# Autres configurations
VITE_APP_NAME=MailManager
VITE_APP_VERSION=1.0.0
```

### 4. Démarrer l'application
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:5173`

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev          # Démarre le serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build de production
npm run lint         # Vérification du code avec ESLint
```

## 📁 Structure du projet

```
src/
├── components/           # Composants React
│   ├── Auth/            # Authentification
│   ├── Dashboard/       # Tableau de bord
│   ├── Mail/           # Gestion courrier
│   ├── Layout/         # Mise en page
│   └── Export/         # Fonctions d'export
├── contexts/           # Contextes React (Auth, etc.)
├── services/          # Services API et logique métier
├── types/            # Types TypeScript
├── i18n/            # Internationalisation
└── App.tsx          # Composant principal
```

## 🎨 Technologies utilisées

- **React 18** - Framework frontend
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Navigation
- **React i18next** - Internationalisation
- **Lucide React** - Icônes
- **date-fns** - Manipulation des dates
- **jsPDF** - Génération PDF
- **Vite** - Build tool moderne

## 🔧 Configuration avancée

### Connexion à l'API Symfony

Pour connecter l'application à votre API Symfony :

1. **Démarrez votre API Symfony** sur `http://localhost:8000`

2. **Modifiez les services** dans `src/services/` :
```typescript
// src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Remplacez les services mock par de vrais appels API
```

3. **Configurez l'authentification JWT** :
```typescript
// Ajoutez le token JWT aux headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Personnalisation du thème

Modifiez `tailwind.config.js` pour personnaliser les couleurs :
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ...
        }
      }
    }
  }
}
```

## 🌍 Internationalisation

L'application supporte le français et l'anglais :

- **Fichiers de traduction** : `src/i18n/index.ts`
- **Changement de langue** : Bouton dans la sidebar
- **Ajout de langues** : Étendre l'objet `resources`

```typescript
// Ajouter une nouvelle traduction
'dashboard.newFeature': 'Nouvelle fonctionnalité'
```

## 📱 Responsive Design

L'application est entièrement responsive :
- **Mobile** : Navigation optimisée, cartes empilées
- **Tablet** : Grille adaptative
- **Desktop** : Interface complète avec sidebar

## 🔒 Sécurité

- **Authentification** : Gestion des tokens JWT
- **Routes protégées** : Redirection automatique
- **Validation** : Côté client et serveur
- **Upload sécurisé** : Validation des types de fichiers

## 📊 Données de test

L'application inclut des données de démonstration :

**Comptes de test :**
- **Admin** : `admin@family.com` / `admin123`
- **Utilisateur** : `user@family.com` / `user123`

**Données incluses :**
- Courriers d'exemple (factures, lettres administratives)
- Différents statuts et types
- Pièces jointes simulées

## 🚀 Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Netlify/Vercel
1. Connectez votre repository
2. Configurez les variables d'environnement
3. Build automatique à chaque push

### Déploiement manuel
```bash
npm run build
# Uploadez le dossier 'dist' sur votre serveur
```

## 🐛 Dépannage

### Problèmes courants

**L'application ne démarre pas :**
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
```

**Erreurs de build :**
```bash
# Vérifiez les types TypeScript
npm run lint
```

**Problèmes d'API :**
- Vérifiez que l'API Symfony fonctionne
- Contrôlez les URLs dans les services
- Vérifiez la configuration CORS

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Roadmap

- [ ] **Notifications push** - Rappels automatiques
- [ ] **Mode hors ligne** - PWA avec cache
- [ ] **Scan OCR** - Reconnaissance automatique de texte
- [ ] **Intégration email** - Import automatique
- [ ] **Statistiques avancées** - Graphiques détaillés
- [ ] **Thèmes** - Mode sombre/clair
- [ ] **API mobile** - Application React Native

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Issues GitHub** : Créez une issue
- **Documentation** : Consultez ce README
- **API** : Voir le README de l'API Symfony

---

**Développé avec ❤️ pour simplifier la gestion du courrier familial**