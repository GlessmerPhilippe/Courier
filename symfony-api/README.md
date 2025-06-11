# Mail Management API

API REST pour la gestion du courrier familial développée avec Symfony 6.3.

## Fonctionnalités

- **Authentification JWT** : Inscription, connexion, gestion des utilisateurs
- **Gestion du courrier** : CRUD complet avec filtres et recherche
- **Upload de pièces jointes** : Support des fichiers PDF, images, documents
- **Administration** : Interface admin pour gérer les utilisateurs
- **Statistiques** : Tableau de bord avec métriques
- **Export** : CSV et données pour PDF
- **API Documentation** : Swagger/OpenAPI intégré
- **Fixtures** : Données de test et utilisateurs prédéfinis
- **Internationalisation** : Support FR/EN
- **Sécurité** : Validation, CORS, protection des endpoints

## Installation

### Prérequis
- PHP 8.1+
- Composer
- SQLite (ou autre base de données)

### Étapes d'installation

1. **Installer les dépendances**
```bash
cd symfony-api
composer install
```

2. **Configurer l'environnement**
```bash
cp .env .env.local
# Éditer .env.local avec vos paramètres
```

Variables d'environnement importantes :
```env
# Base de données
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"

# JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase

# Upload
UPLOAD_DIRECTORY=%kernel.project_dir%/public/uploads
```

3. **Générer les clés JWT**
```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

4. **Créer la base de données**
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

5. **Charger les fixtures (données de test)**
```bash
php bin/console doctrine:fixtures:load
```

6. **Créer le dossier d'upload**
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

7. **Démarrer le serveur**
```bash
symfony server:start
# ou
php -S localhost:8000 -t public/
```

## Utilisateurs créés par les fixtures

### Comptes administrateurs
- **Guillaume Lessmer** : `glessmer@live.fr` / `admin123` (ROLE_ADMIN)
- **Admin Test** : `admin@family.com` / `admin123` (ROLE_ADMIN)

### Comptes utilisateurs
- **Utilisateur Test** : `user@family.com` / `user123` (ROLE_USER)
- **Compte Démo** : `demo@mailmanager.com` / `demo123` (ROLE_USER)

## Documentation API

Une fois le serveur démarré, accédez à la documentation Swagger :
- **URL** : `http://localhost:8000/api/doc`

## Endpoints principaux

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login_check` - Connexion
- `GET /api/profile` - Profil utilisateur

### Courrier
- `GET /api/mails` - Liste des courriers (avec filtres)
- `POST /api/mails` - Créer un courrier
- `GET /api/mails/{id}` - Détails d'un courrier
- `PUT /api/mails/{id}` - Modifier un courrier
- `DELETE /api/mails/{id}` - Supprimer un courrier
- `GET /api/mails/stats` - Statistiques
- `GET /api/mails/overdue` - Courriers en retard

### Administration (ROLE_ADMIN requis)
- `GET /api/admin/users` - Liste des utilisateurs
- `POST /api/admin/users` - Créer un utilisateur
- `PUT /api/admin/users/{id}` - Modifier un utilisateur
- `DELETE /api/admin/users/{id}` - Supprimer un utilisateur
- `GET /api/admin/stats` - Statistiques globales

### Pièces jointes
- `POST /api/mails/{id}/attachments` - Upload de fichier
- `GET /api/attachments/{id}` - Télécharger un fichier
- `DELETE /api/attachments/{id}` - Supprimer un fichier

### Export
- `GET /api/export/csv` - Export CSV
- `GET /api/export/pdf` - Données pour export PDF

## Filtres disponibles

Les endpoints de liste supportent les filtres suivants :
- `type` : Type de courrier (invoice, letter, administrative, etc.)
- `status` : Statut (pending, in_progress, completed, archived)
- `sender` : Expéditeur (recherche partielle)
- `recipient` : Destinataire (recherche partielle)
- `search` : Recherche globale (sujet, expéditeur, destinataire, notes)
- `dateFrom` / `dateTo` : Plage de dates
- `page` / `limit` : Pagination

## Types de courrier supportés

- `invoice` - Facture
- `letter` - Lettre
- `administrative` - Administratif
- `bank` - Banque
- `insurance` - Assurance
- `utility` - Services publics
- `medical` - Médical
- `legal` - Juridique
- `other` - Autre

## Statuts disponibles

- `pending` - En attente
- `in_progress` - En cours
- `completed` - Traité
- `archived` - Archivé

## Formats de fichiers supportés

- PDF : `application/pdf`
- Images : `image/jpeg`, `image/png`, `image/gif`
- Documents : `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Texte : `text/plain`

**Limite** : 10MB par fichier

## Sécurité

- Authentification JWT obligatoire pour tous les endpoints (sauf login/register)
- Validation des données côté serveur
- Protection CSRF désactivée pour l'API
- CORS configuré pour le développement
- Isolation des données par utilisateur
- Interface d'administration protégée par ROLE_ADMIN

## Structure du projet

```
symfony-api/
├── config/           # Configuration Symfony
├── migrations/       # Migrations de base de données
├── public/          # Point d'entrée web
│   └── uploads/     # Fichiers uploadés
├── src/
│   ├── Controller/  # Contrôleurs API
│   ├── Entity/      # Entités Doctrine
│   ├── Repository/  # Repositories
│   ├── DataFixtures/ # Fixtures (données de test)
│   └── Service/     # Services métier
└── var/             # Cache et logs
```

## Développement

### Commandes utiles

```bash
# Créer une nouvelle migration
php bin/console make:migration

# Appliquer les migrations
php bin/console doctrine:migrations:migrate

# Recharger les fixtures
php bin/console doctrine:fixtures:load

# Vider le cache
php bin/console cache:clear

# Voir les routes
php bin/console debug:router

# Valider le schéma de base
php bin/console doctrine:schema:validate

# Créer un utilisateur admin
php bin/console make:user
```

### Gestion des fixtures

Les fixtures créent automatiquement :
- **4 utilisateurs** avec différents rôles
- **Courriers d'exemple** pour chaque utilisateur
- **Données réalistes** pour tester l'application

Pour recharger les fixtures :
```bash
php bin/console doctrine:fixtures:load --no-interaction
```

### Tests

Pour tester l'API, vous pouvez utiliser :
- **Swagger UI** : `http://localhost:8000/api/doc`
- **Postman** : Importer la collection depuis Swagger
- **curl** : Exemples dans la documentation

### Exemple d'utilisation

1. **Se connecter avec votre compte**
```bash
curl -X POST http://localhost:8000/api/login_check \
  -H "Content-Type: application/json" \
  -d '{"username":"glessmer@live.fr","password":"admin123"}'
```

2. **Récupérer vos courriers**
```bash
curl -X GET http://localhost:8000/api/mails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Accéder à l'interface admin**
```bash
curl -X GET http://localhost:8000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Production

Pour déployer en production :

1. Configurer les variables d'environnement
2. Utiliser une vraie base de données (PostgreSQL/MySQL)
3. Configurer un serveur web (Apache/Nginx)
4. Activer le cache de production
5. Configurer les logs
6. Sécuriser les clés JWT
7. Ne pas charger les fixtures en production

## Support

Pour toute question ou problème, consultez :
- Documentation Symfony : https://symfony.com/doc
- Documentation Doctrine : https://www.doctrine-project.org/
- Documentation JWT : https://github.com/lexik/LexikJWTAuthenticationBundle