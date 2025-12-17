<?php
// Test simple d'extraction PDF
$pdfFile = __DIR__ . '/Account_statement_2025_11.pdf';

if (!file_exists($pdfFile)) {
    die("PDF non trouvé\n");
}

echo "=== Extraction brute du PDF ===\n\n";

$content = file_get_contents($pdfFile);
echo "Taille fichier: " . strlen($content) . " octets\n\n";

// Extraction texte entre parenthèses
echo "--- Texte entre parenthèses ---\n";
if (preg_match_all('/\((.*?)\)/s', $content, $matches)) {
    $text = '';
    foreach (array_slice($matches[1], 0, 50) as $i => $match) {
        $decoded = '';
        for ($j = 0; $j < strlen($match); $j++) {
            $char = $match[$j];
            if ($char === '\\') {
                $j++;
                continue;
            }
            $decoded .= $char;
        }
        if (!empty(trim($decoded))) {
            echo ($i + 1) . ". " . $decoded . "\n";
            $text .= $decoded . ' ';
        }
    }
    
    echo "\n--- Recherche de patterns de date/montant ---\n";
    // Chercher des dates
    if (preg_match_all('/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})/', $text, $dates)) {
        echo "Dates trouvées: " . count($dates[0]) . "\n";
        foreach (array_slice($dates[0], 0, 5) as $date) {
            echo "  - $date\n";
        }
    }
    
    // Chercher des montants
    if (preg_match_all('/(-?\d+[\s,\.]\d{2})\s*€?/', $text, $amounts)) {
        echo "\nMontants trouvés: " . count($amounts[0]) . "\n";
        foreach (array_slice($amounts[0], 0, 5) as $amount) {
            echo "  - $amount\n";
        }
    }
}

// Essayer avec les balises de texte PDF
echo "\n--- Recherche dans les flux PDF ---\n";
if (preg_match_all('/BT\s+(.*?)\s+ET/s', $content, $textBlocks)) {
    echo "Blocs de texte trouvés: " . count($textBlocks[0]) . "\n";
}

// Afficher les 500 premiers caractères bruts
echo "\n--- 500 premiers caractères bruts ---\n";
echo substr($content, 0, 500) . "\n";
?>
