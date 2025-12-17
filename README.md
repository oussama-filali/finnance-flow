# FinanceFlow : Gestionnaire de Budget Harmonique

## Description
FinanceFlow est une application full-stack de gestion budgétaire développée avec React (frontend) et PHP/MariaDB (backend). Elle permet d'ajouter, qualifier, afficher et filtrer des transactions, avec visualisation graphique. Intégration expérimentale d'un "langage harmonique" inspiré de φ (nombre d'or) et Fibonacci pour des comportements UI dynamiques.

## Fonctionnalités
- ✅ Ajout/édition/suppression de transactions (date, lieu, titre, description, catégorie/sous-catégorie)
- ✅ **Import CSV/PDF/Images** avec détection automatique de format
- ✅ **Import texte** pour relevés bancaires
- ✅ **Catégorisation automatique** par mots-clés (IA basique)
- ✅ Affichage liste transactions avec tri/filtres avancés (catégorie, date, montant, recherche)
- ✅ Calcul et affichage du solde restant
- ✅ Dashboard avec graphiques (Chart.js) : historique, répartition
- ✅ **Design UI/UX moderne** : gradients, animations, effets visuels
- ✅ Responsive mobile-first (Tailwind CSS)
- ✅ Authentification basique (sessions PHP)
- ✅ Partage de transactions (optionnel)

## Formats d'Import Supportés
- **CSV** : Format standard avec colonnes Date, Title, Amount, Location
- **PDF** : Relevés bancaires au format PDF
- **Images** : PNG, JPG, JPEG (extraction de texte)
- **Texte** : Copier-coller de relevés bancaires

## Architecture
- **Frontend** : Vanilla JavaScript (ES6 modules), Vite, Tailwind CSS
- **Backend** : PHP 7.4+ MVC, API REST (PDO, prepared statements)
- **Base** : MariaDB (schema relationnel)

## Installation
1. Cloner le repo : `git clone https://github.com/prenom-nom/finance-flow.git`
2. Backend : Configurer MariaDB, exécuter `sql/schema.sql` et `sql/seed.sql`
3. Variables env : Créer `.env` dans backend/ avec `DB_HOST=localhost; DB_NAME=financeflow; DB_USER=...; DB_PASS=...`
4. Frontend : `cd frontend && npm install`
5. Backend : `cd backend && composer install` (si utilisé) ou démarrer serveur PHP intégré

## Lancement
- Backend : `cd backend && php -S localhost:8000`
- Frontend : `cd frontend && npm run dev` (ouvre sur localhost:5173)
- DB : Assurer MariaDB en cours

## Tests
- API : Scripts curl dans `tests/api_tests.sh`
- PHP : `cd backend && php tests/TransactionTest.php`
- Manuel : Vérifier responsive, CRUD, graphiques

## Déploiement Plesk
1. Build frontend : `cd frontend && npm run build`
2. Copier `frontend/dist/` vers Plesk public_html/
3. Backend : Upload backend/ vers sous-domaine API, config vhost PHP
4. DB : Importer schema sur MariaDB Plesk
5. Env vars : Configurer dans Plesk

## Sécurité
- Prepared statements PDO (protection SQL injection)
- Validation des données côté serveur
- Sessions sécurisées (httponly, samesite)
- Headers de sécurité HTTP (X-Frame-Options, CSP, etc.)
- Upload de fichiers avec validation MIME stricte
- Rate limiting sur les connexions (recommandé en production)
