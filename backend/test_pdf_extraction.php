<?php
// Test d'extraction PDF
require_once __DIR__ . '/ImportController.php';
require_once __DIR__ . '/config.php';

$pdfFile = __DIR__ . '/Account_statement_2025_11.pdf';

if (!file_exists($pdfFile)) {
    die("Fichier PDF non trouvé: $pdfFile\n");
}

echo "=== Test extraction PDF ===\n";
echo "Fichier: $pdfFile\n\n";

// Créer une instance du contrôleur
$controller = new ImportController();

// Utiliser reflection pour accéder aux méthodes privées
$reflection = new ReflectionClass($controller);

// Test extractPDFText
$extractMethod = $reflection->getMethod('extractPDFText');
$extractMethod->setAccessible(true);

echo "--- Extraction du texte ---\n";
$text = $extractMethod->invoke($controller, $pdfFile);

if ($text) {
    echo "Texte extrait (" . strlen($text) . " caractères):\n";
    echo substr($text, 0, 500) . "...\n\n";
} else {
    echo "Aucun texte extrait\n\n";
}

// Test parseText
if ($text) {
    $parseMethod = $reflection->getMethod('parseText');
    $parseMethod->setAccessible(true);
    
    echo "--- Parsing des transactions ---\n";
    $transactions = $parseMethod->invoke($controller, $text);
    
    echo "Nombre de transactions trouvées: " . count($transactions) . "\n\n";
    
    if (!empty($transactions)) {
        echo "Premières transactions:\n";
        foreach (array_slice($transactions, 0, 5) as $i => $t) {
            echo ($i + 1) . ". Date: {$t['date']}, Titre: {$t['title']}, Montant: {$t['amount']}\n";
        }
    }
} else {
    echo "Impossible de parser: pas de texte extrait\n";
}
?>
