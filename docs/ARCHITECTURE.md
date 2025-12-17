# 🏗️ Architecture du Projet - FinanceFlow

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                               │
│              (Navigateur Web - Chrome/Firefox)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─────────► Frontend (Vite + Vanilla JS)
                       │           Port 5173
                       │           ├── Views (Pages)
                       │           ├── Components (UI)
                       │           ├── Services (API calls)
                       │           └── Utils (Helpers)
                       │
                       ├─────────► Backend (PHP 7.4.33)
                       │           Port 8000
                       │           ├── Controllers
                       │           ├── Models
                       │           └── Auth
                       │
                       └─────────► Base de données (MariaDB)
                                   Port 3306
                                   └── Tables (users, transactions, categories)
```

---

## 📁 Structure des fichiers

```
finnance-flow/
│
├── 📂 docs/                          # Documentation du projet
│   ├── EXTRACTION_DONNEES.md         # Guide regex & parsing
│   ├── ARCHITECTURE.md               # Ce fichier
│   ├── DOCUMENTATION.md              # Doc générale
│   └── NOUVEAUTES.md                 # Changelog
│
├── 📂 backend/                       # API PHP
│   ├── index.php                     # Point d'entrée (routing)
│   ├── config.php                    # Connexion DB + sessions
│   │
│   ├── 📂 Auth/                      # Authentification
│   │   ├── Login.php                 # POST /Auth/Login.php
│   │   ├── Register.php              # POST /Auth/Register.php
│   │   └── Logout.php                # POST /Auth/Logout.php
│   │
│   ├── TransactionController.php     # CRUD transactions
│   ├── TransactionModel.php          # Requêtes SQL transactions
│   ├── CategoryController.php        # Gestion catégories
│   ├── UserController.php            # GET /user (session)
│   ├── ImportController.php          # Import PDF/CSV/Images
│   ├── KeywordMatcher.php            # Catégorisation auto
│   │
│   └── 📂 Test/                      # Tests PHPUnit
│       ├── IndexTest.php
│       ├── LoginTest.php
│       └── TransactionControllerTest.php
│
├── 📂 frontend/                      # Application Vite
│   ├── index.html                    # Point d'entrée HTML
│   ├── package.json                  # Dépendances npm
│   ├── vite.config.js                # Config Vite
│   ├── tailwind.config.js            # Config Tailwind CSS
│   │
│   └── 📂 src/                       # Code source
│       ├── main.js                   # Import app.js + styles
│       ├── app.js                    # Orchestrateur (routing)
│       ├── index.css                 # Styles Tailwind
│       │
│       ├── 📂 services/              # Couche API
│       │   ├── api.js                # Fonction apiRequest()
│       │   ├── authService.js        # login(), register(), logout()
│       │   ├── transactionService.js # CRUD transactions
│       │   ├── categoryService.js    # getAllCategories()
│       │   └── importService.js      # importFile()
│       │
│       ├── 📂 views/                 # Pages complètes
│       │   ├── LoginView.js          # Page connexion
│       │   ├── RegisterView.js       # Page inscription
│       │   ├── DashboardView.js      # Page dashboard
│       │   └── TransactionsView.js   # Page transactions (CRUD + import)
│       │
│       ├── 📂 components/            # Composants réutilisables
│       │   ├── Shell.js              # Header + Footer + Nav
│       │   ├── TransactionForm.js    # Formulaire transaction
│       │   ├── TransactionList.js    # Ligne de transaction
│       │   ├── MonthNavigation.js    # Navigation mensuelle
│       │   └── ImportForm.js         # Upload de fichiers
│       │
│       └── 📂 utils/                 # Fonctions utilitaires
│           ├── helpers.js            # setBusy(), renderErrorBlock()
│           ├── templates.js          # inputBase(), cardShell()
│           └── dateUtils.js          # Groupement par mois
│
├── 📂 sql/                           # Scripts SQL
│   ├── schema.sql                    # Structure des tables
│   └── seed.sql                      # Données de test
│
└── 📂 tests/                         # Fichiers de test
    ├── sample-import.csv
    └── test_import.csv
```

---

## 🔄 Flux de données

### 1. Authentification

```
┌──────────┐       POST /Auth/Login.php      ┌──────────┐
│ Frontend │ ────────────────────────────────>│ Backend  │
│          │   {username, password}           │          │
│          │                                  │  Check   │
│          │                                  │  DB      │
│          │<────────────────────────────────│          │
│          │   {success, user}                │          │
│          │   + Set-Cookie: PHPSESSID        │          │
└──────────┘                                  └──────────┘
```

### 2. Chargement des transactions

```
┌──────────┐       GET /transactions         ┌──────────┐       ┌──────────┐
│ Frontend │ ───────────────────────────────>│ Backend  │──────>│   DB     │
│          │   Cookie: PHPSESSID              │          │       │          │
│          │                                  │  Check   │       │  SELECT  │
│          │                                  │  Session │       │  WHERE   │
│          │<───────────────────────────────│          │<──────│ user_id  │
│          │   [{id, title, amount, ...}]    │          │       │          │
└──────────┘                                  └──────────┘       └──────────┘
```

### 3. Import de fichier (PDF)

```
┌──────────┐       POST /import              ┌──────────┐
│ Frontend │ ───────────────────────────────>│ Backend  │
│          │   FormData: file=releve.pdf      │          │
│          │                                  │  1. PDFParser→ Texte
│          │                                  │  2. Regex → Transactions[]
│          │                                  │  3. INSERT INTO DB
│          │<───────────────────────────────│          │
│          │   {imported: 94, errors: []}    │          │
└──────────┘                                  └──────────┘
```

---

## 🎨 Architecture Frontend (Modular)

### Principe : Séparation des responsabilités

Chaque fichier fait **UNE SEULE CHOSE** (max 300 lignes).

#### Couche 1 : Services (Communication API)

```javascript
// services/api.js
export async function apiRequest(path, options) {
  const res = await fetch(`http://localhost:8000/${path}`, {
    ...options,
    credentials: 'include' // Cookies
  });
  return await res.json();
}

// services/transactionService.js
import { apiRequest } from './api.js';

export async function getAllTransactions() {
  return await apiRequest('transactions');
}

export async function createTransaction(data) {
  return await apiRequest('transactions', {
    method: 'POST',
    json: data
  });
}
```

#### Couche 2 : Utils (Helpers)

```javascript
// utils/dateUtils.js
export function groupTransactionsByMonth(transactions) {
  const byMonth = new Map();
  transactions.forEach(tx => {
    const month = tx.date.substring(0, 7); // "2025-12"
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(tx);
  });
  return byMonth;
}
```

#### Couche 3 : Components (UI réutilisables)

```javascript
// components/TransactionList.js
export function transactionRowTemplate(tx) {
  return `
    <div class="transaction-row">
      <span>${tx.title}</span>
      <span>${tx.amount.toFixed(2)} €</span>
      <button data-action="edit" data-id="${tx.id}">Éditer</button>
    </div>
  `;
}
```

#### Couche 4 : Views (Pages complètes)

```javascript
// views/TransactionsView.js
import { getAllTransactions } from '../services/transactionService.js';
import { transactionRowTemplate } from '../components/TransactionList.js';
import { groupTransactionsByMonth } from '../utils/dateUtils.js';

export async function renderTransactionsView(state) {
  const transactions = await getAllTransactions();
  const byMonth = groupTransactionsByMonth(transactions);
  
  const html = transactions.map(transactionRowTemplate).join('');
  return `<div>${html}</div>`;
}
```

#### Couche 5 : App (Orchestrateur)

```javascript
// app.js
import { renderTransactionsView } from './views/TransactionsView.js';

const state = {
  user: null,
  transactions: [],
  currentMonth: null,
  currentPage: 1
};

async function render() {
  const route = location.hash;
  
  if (route === '#/transactions') {
    const html = await renderTransactionsView(state);
    document.getElementById('app').innerHTML = html;
  }
}

window.addEventListener('hashchange', render);
```

---

## 🗄️ Architecture Backend (MVC-like)

### Pattern utilisé : Controller → Model → Database

```php
// index.php (Router)
if ($path === 'transactions') {
    $controller = new TransactionController();
    $controller->getAll();
}

// TransactionController.php (Business logic)
class TransactionController {
    private $model;
    
    public function __construct() {
        $this->model = new TransactionModel();
    }
    
    public function getAll() {
        $userId = $_SESSION['user_id'];
        $transactions = $this->model->findByUser($userId);
        echo json_encode($transactions);
    }
}

// TransactionModel.php (Data access)
class TransactionModel {
    private $pdo;
    
    public function findByUser($userId) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM transactions 
            WHERE user_id = ? 
            ORDER BY date DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
```

---

## 🔐 Sécurité

### Sessions PHP

```php
// config.php
session_start();
session_set_cookie_params([
    'lifetime' => 3600,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax'
]);
```

### CORS (Cross-Origin)

```php
// index.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
```

### Validation des données

```php
// Avant INSERT
$title = htmlspecialchars(trim($_POST['title']));
$amount = floatval($_POST['amount']);

$stmt = $pdo->prepare("INSERT INTO transactions (title, amount) VALUES (?, ?)");
$stmt->execute([$title, $amount]);
```

---

## 📊 Base de données

### Tables principales

```sql
-- Utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catégories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50)
);

-- Transactions
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    category_id INT,
    subcategory_text VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### Relations

```
users (1) ──────┐
                │
                ├──── (N) transactions (N) ──── (1) categories
```

---

## 🚀 Performance

### Pagination côté serveur

```php
// GET /transactions?page=1&limit=10
$page = intval($_GET['page'] ?? 1);
$limit = intval($_GET['limit'] ?? 10);
$offset = ($page - 1) * $limit;

$stmt = $pdo->prepare("
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY date DESC 
    LIMIT ? OFFSET ?
");
$stmt->execute([$userId, $limit, $offset]);
```

### Mise en cache frontend

```javascript
// app.js
const state = {
  transactions: [], // Cache en mémoire
};

// Ne recharger que si vide
if (!state.transactions.length) {
  state.transactions = await getAllTransactions();
}
```

---

## 🧪 Tests

### Backend (PHPUnit)

```php
// Test/TransactionControllerTest.php
class TransactionControllerTest extends TestCase {
    public function testGetAllReturnsTransactions() {
        $_SESSION['user_id'] = 1;
        
        $controller = new TransactionController();
        ob_start();
        $controller->getAll();
        $output = ob_get_clean();
        
        $data = json_decode($output, true);
        $this->assertIsArray($data);
    }
}
```

### Frontend (Manuel)

```bash
# Tester l'import
curl -X POST http://localhost:8000/import \
  -F "file=@tests/sample-import.csv"
```

---

## 📦 Déploiement

### Prérequis serveur

- PHP 7.4+
- MySQL/MariaDB
- Composer
- Node.js 18+

### Installation

```bash
# Backend
cd backend
composer install
php -S localhost:8000 index.php

# Frontend
cd frontend
npm install
npm run dev   # Dev
npm run build # Production
```

### Production

```bash
npm run build
# Sortie : frontend/dist/

# Servir avec Apache/Nginx
```

---

## 🔮 Évolutions futures

- [ ] Tests automatisés E2E (Cypress)
- [ ] Notifications push
- [ ] Export Excel
- [ ] Graphiques Chart.js
- [ ] Mode hors ligne (Service Worker)
- [ ] Multi-devises

---

**Auteur** : FinanceFlow Team  
**Dernière mise à jour** : 17 décembre 2025
