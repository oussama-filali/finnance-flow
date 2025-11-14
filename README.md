# FinanceFlow : Gestionnaire de Budget Harmonique

## Description
FinanceFlow est une application full-stack de gestion budgétaire développée avec React (frontend) et PHP/MariaDB (backend). Elle permet d'ajouter, qualifier, afficher et filtrer des transactions, avec visualisation graphique. Intégration expérimentale d'un "langage harmonique" inspiré de φ (nombre d'or) et Fibonacci pour des comportements UI dynamiques.

## Fonctionnalités
- Ajout/édition/suppression de transactions (date, lieu, titre, description, catégorie/sous-catégorie)
- Affichage liste transactions avec tri/filtres (catégorie, date, montant)
- Calcul et affichage du solde restant
- Dashboard avec graphiques (Chart.js) : historique, répartition
- Responsive mobile-first (Tailwind CSS)
- Authentification basique (sessions PHP)
- Partage de transactions (optionnel)
- Règles harmoniques via `main.harm` et interpréteur JS (proportions φ, animations Fibonacci)

## Architecture
- **Frontend** : React + Vite, mobile-first, Tailwind
- **Backend** : PHP MVC simple, API REST (PDO, prepared statements)
- **Base** : MariaDB (schema relationnel)
- **Expérimental** : `main.harm` (règles), mini-interpréteur JS

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

## Présentation
Slides PDF : `docs/presentation.pdf` (à créer)

## Sécurité
- Prepared statements PDO
- Validation input
- Sessions pour auth
- Pas d'infos sensibles dans repo

## Langage Harmonique
- `main.harm` : Règles (ex. : `phi_ratio: 1.618; fib_anim: sequence(5);`)
- Interpréteur JS : Applique proportions CSS, animations côté client