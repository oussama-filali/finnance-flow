# 📊 Guide d'Extraction de Données - FinanceFlow

## Table des matières

1. [Introduction](#introduction)
2. [Architecture d'Extraction](#architecture-dextraction)
3. [Les Expressions Régulières (Regex)](#les-expressions-régulières-regex)
4. [Extraction PDF avec BLING Bank](#extraction-pdf-avec-bling-bank)
5. [Extraction CSV](#extraction-csv)
6. [Extraction d'Images (OCR)](#extraction-dimages-ocr)
7. [Debugging et Maintenance](#debugging-et-maintenance)

---

## Introduction

L'extraction de données dans FinanceFlow permet d'importer automatiquement des transactions depuis plusieurs formats :
- **PDF** (relevés bancaires BLING)
- **CSV** (fichiers Excel exportés)
- **PNG/JPG** (photos de relevés via OCR)

Le système analyse le contenu et extrait les informations structurées (date, montant, description, lieu).

---

## Architecture d'Extraction

### Fichier principal : `backend/ImportController.php`

```
ImportController
├── handleUpload() → Gère le fichier uploadé
├── parsePDF()     → Extrait texte avec smalot/pdfparser
├── parseCSV()     → Lit lignes CSV
├── parseImage()   → OCR avec Tesseract
└── parseText()    → Regex pour extraire transactions
```

### Flux de traitement

```
1. Upload fichier (FormData)
   ↓
2. Validation type MIME
   ↓
3. Extraction du texte brut
   ↓
4. Parsing avec regex
   ↓
5. Stockage en base de données
   ↓
6. Retour JSON {imported: N, errors: [...]}
```

---

## Les Expressions Régulières (Regex)

### Qu'est-ce qu'une regex ?

Une **expression régulière** est un motif (pattern) qui décrit un ensemble de chaînes de caractères. C'est comme un filtre intelligent.

### Syntaxe de base

| Symbole | Signification | Exemple |
|---------|---------------|---------|
| `\d` | Un chiffre (0-9) | `\d{2}` = 2 chiffres |
| `\w` | Lettre/chiffre | `\w+` = 1+ caractères |
| `\s` | Espace blanc | `\s*` = 0+ espaces |
| `+` | 1 ou plusieurs | `A+` = A, AA, AAA... |
| `*` | 0 ou plusieurs | `A*` = "", A, AA... |
| `?` | 0 ou 1 | `A?` = "" ou A |
| `^` | Début de ligne | `^Date` = ligne commence par "Date" |
| `$` | Fin de ligne | `EUR$` = ligne finit par "EUR" |
| `[...]` | Classe de caractères | `[+-]` = + ou - |
| `(...)` | Groupe de capture | `(\d+)` = capture les chiffres |

### Exemple concret : Date

```php
$pattern = '/^(\d{2})\/(\d{2})\/(\d{4})$/';
$text = "17/12/2025";

preg_match($pattern, $text, $matches);
// $matches[0] = "17/12/2025"  (tout)
// $matches[1] = "17"           (jour)
// $matches[2] = "12"           (mois)
// $matches[3] = "2025"         (année)
```

**Explication** :
- `^` = Début de ligne
- `(\d{2})` = Capture 2 chiffres (jour)
- `\/` = Le caractère `/` littéral (échappé)
- `(\d{2})` = Capture 2 chiffres (mois)
- `\/` = Deuxième `/`
- `(\d{4})` = Capture 4 chiffres (année)
- `$` = Fin de ligne

---

## Extraction PDF avec BLING Bank

### Format multiligne BLING

Les relevés BLING ont ce format :

```
17/12/2025
Achat CB CARREFOUR MARKET
PARIS 75015
+45.80 EUR

18/12/2025
Retrait DAB BNP PARIBAS
LYON 69001
-50.00 EUR
```

### Problème initial

❌ **Ancien code** : Cherchait tout sur UNE ligne
```php
'/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\+\-])\s*(\d+[,\.]\d{2})\s*EUR/'
```
➜ Résultat : **0 transaction extraite** ❌

### Solution actuelle

✅ **Nouveau code** : Lit ligne par ligne en mode "état"

```php
function parseText($text) {
    $lines = explode("\n", $text);
    $transactions = [];
    $currentDate = null;
    $currentDescription = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        // 1️⃣ Détecter une DATE
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $line, $m)) {
            $currentDate = "$m[3]-$m[2]-$m[1]"; // YYYY-MM-DD
            $currentDescription = [];
            continue;
        }
        
        // 2️⃣ Détecter un MONTANT (fin de transaction)
        if (preg_match('/^([\+\-])\s*(\d+[,\.]\d{2})\s*EUR$/i', $line, $m)) {
            $sign = $m[1];
            $amount = floatval(str_replace(',', '.', $m[2]));
            if ($sign === '-') $amount = -$amount;
            
            // Créer la transaction
            $transactions[] = [
                'date' => $currentDate,
                'title' => $currentDescription[0] ?? 'Transaction',
                'description' => implode(' ', $currentDescription),
                'amount' => $amount,
                'location' => $currentDescription[1] ?? null,
            ];
            
            // Reset
            $currentDate = null;
            $currentDescription = [];
            continue;
        }
        
        // 3️⃣ Sinon c'est une ligne de DESCRIPTION
        if ($currentDate && !empty($line)) {
            $currentDescription[] = $line;
        }
    }
    
    return $transactions;
}
```

### Regex détaillées

#### 1️⃣ Pattern DATE
```php
'/^(\d{2})\/(\d{2})\/(\d{4})$/'
```
- `^` = Début de ligne
- `(\d{2})` = **Groupe 1** : 2 chiffres (jour)
- `\/` = Slash littéral
- `(\d{2})` = **Groupe 2** : 2 chiffres (mois)
- `\/` = Slash littéral
- `(\d{4})` = **Groupe 3** : 4 chiffres (année)
- `$` = Fin de ligne (rien d'autre sur la ligne)

**Exemples valides** :
- `17/12/2025` ✅
- `01/01/2024` ✅

**Exemples invalides** :
- `17/12/2025 PARIS` ❌ (texte après)
- `2025/12/17` ❌ (ordre inversé)

#### 2️⃣ Pattern MONTANT
```php
'/^([\+\-])\s*(\d+[,\.]\d{2})\s*EUR$/i'
```
- `^` = Début
- `([\+\-])` = **Groupe 1** : signe + ou -
- `\s*` = 0+ espaces (optionnels)
- `(\d+[,\.]\d{2})` = **Groupe 2** : nombre avec 2 décimales
  - `\d+` = 1+ chiffres (partie entière)
  - `[,\.]` = virgule OU point
  - `\d{2}` = exactement 2 chiffres (centimes)
- `\s*` = 0+ espaces
- `EUR` = Texte littéral "EUR"
- `$` = Fin de ligne
- `i` = **Insensible à la casse** (EUR, eur, Eur)

**Exemples valides** :
- `+45.80 EUR` ✅
- `-50,00 eur` ✅
- `+1234.56EUR` ✅

**Exemples invalides** :
- `45.8 EUR` ❌ (1 seule décimale)
- `+45.80` ❌ (pas de "EUR")

---

## Extraction CSV

### Format attendu

```csv
date,title,amount,location,description
2025-12-17,Carrefour,45.80,Paris,Courses
2025-12-18,Retrait,-50.00,Lyon,DAB
```

### Code d'extraction

```php
function parseCSV($filepath) {
    $transactions = [];
    $file = fopen($filepath, 'r');
    $headers = fgetcsv($file); // Première ligne = colonnes
    
    while (($row = fgetcsv($file)) !== false) {
        $transactions[] = [
            'date' => $row[0],
            'title' => $row[1],
            'amount' => floatval($row[2]),
            'location' => $row[3] ?? null,
            'description' => $row[4] ?? null,
        ];
    }
    
    fclose($file);
    return $transactions;
}
```

**Pas de regex nécessaire** car le format CSV est déjà structuré.

---

## Extraction d'Images (OCR)

### Prérequis

Installation de **Tesseract OCR** :

```bash
# Windows (avec Chocolatey)
choco install tesseract

# Linux
sudo apt install tesseract-ocr tesseract-ocr-fra

# Mac
brew install tesseract tesseract-lang
```

### Code d'extraction

```php
function parseImage($filepath) {
    // Convertir image → texte avec Tesseract
    $command = "tesseract " . escapeshellarg($filepath) . " stdout -l fra";
    $text = shell_exec($command);
    
    // Réutiliser la fonction parseText()
    return $this->parseText($text);
}
```

### Qualité OCR

⚠️ L'OCR peut produire des erreurs :
- **Problème** : "0" confondu avec "O", "1" avec "l"
- **Solution** : Validation + correction manuelle

---

## Debugging et Maintenance

### Logs d'extraction

Le système log dans le terminal PHP :

```php
error_log("📄 Extraction PDF : " . count($transactions) . " transactions");
error_log("Pattern match date: " . ($matches ? 'OUI' : 'NON'));
```

### Tester l'extraction

1. **Créer un fichier de test** : `tests/sample-bling.txt`
```
17/12/2025
Achat CB CARREFOUR
PARIS 75015
+45.80 EUR
```

2. **Tester avec cURL** :
```bash
curl -X POST http://localhost:8000/import \
  -F "file=@tests/sample-bling.txt"
```

3. **Vérifier la réponse** :
```json
{
  "success": true,
  "imported": 1,
  "errors": []
}
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `0 transaction extraite` | Regex ne match pas | Afficher le texte brut avec `var_dump($text)` |
| `Undefined variable $patterns` | Variable non initialisée | Vérifier la déclaration en début de fonction |
| `Date invalide` | Format incorrect | Convertir en YYYY-MM-DD |
| `Duplicate entry` | Transaction déjà existante | Ajouter check `ON DUPLICATE KEY IGNORE` |

### Améliorer les regex

Pour tester vos regex en ligne : **regex101.com**

1. Coller votre pattern
2. Coller un exemple de texte
3. Voir les matches en temps réel
4. Lire l'explication détaillée

---

## Conclusion

L'extraction de données repose sur 3 piliers :

1. **Parsing du format** (PDF, CSV, Image → Texte)
2. **Regex intelligentes** (comprendre le motif)
3. **Gestion d'état** (multiligne, accumulation)

**Résultat** : 94 transactions extraites automatiquement depuis un relevé BLING PDF ! 🎉
