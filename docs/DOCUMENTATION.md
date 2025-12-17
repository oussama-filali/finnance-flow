# 📚 Documentation Technique - FinanceFlow

## 🎯 Vue d'ensemble

FinanceFlow est une application web full-stack moderne de gestion budgétaire, avec une touche unique : un système d'animations et de proportions basé sur le **nombre d'or (φ)** et la **suite de Fibonacci**.

---

## 🏗️ Architecture

### Stack Technologique

#### Frontend
- **React 19** - Framework JavaScript moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Framer Motion** - Animations fluides
- **Three.js + React Three Fiber** - Rendu 3D
- **Chart.js** - Graphiques interactifs
- **Axios** - Client HTTP
- **React Router** - Navigation SPA

#### Backend
- **PHP 8.2** - Serveur backend
- **MariaDB/MySQL** - Base de données relationnelle
- **PDO** - Accès base de données sécurisé
- **Sessions PHP** - Gestion authentification

---

## 📁 Structure des Dossiers

```
finnance-flow/
│
├── backend/                    # API PHP
│   ├── config.php             # Configuration DB
│   ├── index.php              # Point d'entrée + Routing
│   ├── TransactionController.php
│   ├── TransactionModel.php
│   ├── UserController.php
│   ├── CategoryController.php
│   ├── Auth/
│   │   ├── Login.php
│   │   ├── Logout.php
│   │   └── Register.php
│   └── Test/                  # Tests unitaires PHP
│
├── frontend/                   # Application React
│   ├── public/
│   │   └── main.harm          # Langage harmonique
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── BalanceCard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionChart.jsx
│   │   │   ├── RecentTransactions.jsx
│   │   │   └── Scene3D.jsx    # Composant 3D
│   │   ├── pages/             # Pages principales
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Transactions.jsx
│   │   ├── context/           # Context React
│   │   │   └── AuthContext.jsx
│   │   ├── services/          # Services API
│   │   │   └── api.js
│   │   ├── utils/             # Utilitaires
│   │   │   └── harmonicLanguage.js
│   │   ├── App.jsx            # Composant racine
│   │   ├── main.jsx           # Point d'entrée
│   │   └── index.css          # Styles globaux
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
└── sql/                       # Scripts SQL
    ├── schema.sql             # Schéma base de données
    └── seed.sql               # Données de test
```

---

## 🔐 Authentification

### Flux d'authentification
1. L'utilisateur se connecte via `/login`
2. Backend vérifie credentials avec `password_verify()`
3. Session PHP créée avec `$_SESSION['user_id']`
4. Frontend stocke user dans `localStorage` + `AuthContext`
5. Toutes les requêtes API incluent credentials (cookies)

### Sécurité
- ✅ Mots de passe hashés avec `password_hash()` (bcrypt)
- ✅ Prepared statements PDO (protection SQL injection)
- ✅ Sessions PHP sécurisées
- ✅ CORS configuré
- ✅ Validation côté client et serveur

---

## 🔄 API Backend

### Endpoints

#### Authentification
```
POST /Auth/Login.php
POST /Auth/Register.php
POST /Auth/Logout.php
```

#### Transactions
```
GET    /transactions          - Liste toutes les transactions
GET    /transactions/{id}     - Détails d'une transaction
GET    /transactions/balance  - Calcul du solde
POST   /transactions          - Créer une transaction
PUT    /transactions/{id}     - Modifier une transaction
DELETE /transactions/{id}     - Supprimer une transaction
```

#### Catégories
```
GET  /categories                      - Liste des catégories
GET  /categories/{id}/subcategories   - Sous-catégories
POST /categories                      - Créer une catégorie
```

#### Utilisateur
```
GET /user      - Profil utilisateur
PUT /user      - Modifier profil
```

### Exemple de requête
```javascript
// Créer une transaction
const response = await axios.post('http://localhost:8000/transactions', {
  title: 'Course supermarché',
  amount: -45.50,
  date: '2025-12-14',
  location: 'Carrefour',
  category_id: 3,
  description: 'Courses hebdomadaires'
}, {
  withCredentials: true
})
```

---

## 🎨 Système Harmonique

### Principe
Le projet utilise le **nombre d'or (φ = 1.618)** pour créer des proportions visuellement agréables et la **suite de Fibonacci** pour les animations échelonnées.

### Fichier `main.harm`
Format simple de configuration :
```
phi_ratio: 1.618;
spacing_medium: phi * 1rem;
duration_normal: 0.618;
```

### Utilisation dans le code
```javascript
import { goldenRatio } from './utils/harmonicLanguage'

// Espacement harmonique
<div style={{ padding: goldenRatio.spacing.md }}>

// Animation avec durée φ
<motion.div
  animate={{ scale: 1 }}
  transition={{ duration: goldenRatio.duration.normal }}
/>
```

### Proportions disponibles
- `phi` = 1.618
- `phiInverse` = 0.618
- `phi2` = 2.618
- `phi3` = 4.236

---

## 📊 Visualisations

### Graphiques (Chart.js)
- **Pie Chart** : Répartition par catégorie
- **Line Chart** : Évolution sur 7 jours

### 3D (Three.js)
- Sphère animée interactive
- Rotation automatique
- Distorsion dynamique

---

## 🎭 Animations (Framer Motion)

### Variants harmoniques
```javascript
const slideVariants = {
  hidden: { x: -100 * 0.618, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.618 }
  }
}
```

### Stagger Fibonacci
```javascript
{transactions.map((t, i) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: i * 0.05 }}
  />
))}
```

---

## 🗄️ Base de Données

### Schéma

#### Table `users`
```sql
id INT PRIMARY KEY AUTO_INCREMENT
username VARCHAR(50) UNIQUE
password_hash VARCHAR(255)
created_at TIMESTAMP
```

#### Table `transactions`
```sql
id INT PRIMARY KEY AUTO_INCREMENT
user_id INT (FK → users)
title VARCHAR(255)
description TEXT
amount DECIMAL(10,2)
date DATE
location VARCHAR(255)
category_id INT (FK → categories)
subcategory_id INT (FK → subcategories)
created_at TIMESTAMP
```

#### Table `categories`
8 catégories prédéfinies :
- Logement
- Services
- Alimentation et épicerie
- Transport
- Soins de santé
- Service de garde et éducation
- Soins personnels et mieux-être
- Remboursement des dettes

---

## 🧪 Tests

### Backend (PHP)
```bash
cd backend/Test
php TransactionModelTest.php
php LoginTest.php
```

### Frontend (Manuel)
1. Login avec `testuser` / `password`
2. Créer une transaction
3. Vérifier graphiques
4. Tester filtres
5. Tester responsive

---

## 🚀 Déploiement

### Build Production
```bash
cd frontend
npm run build
# Sortie dans frontend/dist/
```

### Plesk
1. Upload `frontend/dist/` → `public_html/`
2. Upload `backend/` → `api/`
3. Configurer base de données
4. Ajuster CORS dans `index.php`
5. Créer `.env` avec credentials

---

## 📈 Améliorations Futures

### Fonctionnalités
- [ ] Export PDF/Excel des transactions
- [ ] Notifications push
- [ ] Budgets mensuels
- [ ] Objectifs d'épargne
- [ ] Multi-devises
- [ ] Mode sombre

### Technique
- [ ] Tests E2E (Playwright/Cypress)
- [ ] PWA (Progressive Web App)
- [ ] WebSockets temps réel
- [ ] Cache API (Redis)
- [ ] Docker containerization

### Design
- [ ] Plus d'effets 3D
- [ ] Particules interactives
- [ ] Transitions de page fluides
- [ ] Micro-interactions

---

## 🤝 Contribution

Ce projet est un projet académique démontrant :
- ✅ Architecture MVC backend
- ✅ SPA moderne avec React
- ✅ Design system harmonieux
- ✅ Animations avancées
- ✅ Rendu 3D
- ✅ Sécurité web

---

## 📞 Support

Pour toute question technique, référez-vous à :
- `INSTALLATION.md` - Guide de démarrage
- `README.md` - Vue d'ensemble
- Cette documentation technique

**Développé avec ❤️ et φ (nombre d'or)**
