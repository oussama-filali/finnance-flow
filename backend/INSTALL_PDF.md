# Installation de l'extraction PDF

## Étape 1 : Installer Composer
Si vous n'avez pas Composer installé :
- Télécharger depuis https://getcomposer.org/download/
- Ou utiliser : `php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php composer-setup.php`

## Étape 2 : Installer les dépendances
```bash
cd C:\wamp64\www\finnance-flow\backend
composer install
```

Cela va installer `smalot/pdfparser` qui permet d'extraire le texte des PDF.

## Étape 3 : Tester l'extraction
```bash
php test_pdf_extraction.php
```

## Formats supportés

### CSV
Colonnes attendues : Date, Title, Amount, Location
```csv
Date,Title,Amount,Location
15/12/2024,CARREFOUR,-45.50,Paris
```

### PDF
Relevés bancaires avec format :
```
DD/MM/YYYY Description Montant €
15/12/2024 CARREFOUR -45.50 €
```

### Images (PNG, JPG)
Extraction basique de texte (pour OCR complet, installer Tesseract)

## Dépannage

### Si composer install ne fonctionne pas
Le code utilise un fallback qui extrait le texte de manière basique sans bibliothèque externe.

### Si aucune transaction n'est détectée
Vérifiez le format du relevé avec :
```bash
php test_pdf_extraction.php
```

Cela affichera le texte extrait pour debug.
