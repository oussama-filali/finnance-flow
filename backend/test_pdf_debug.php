<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/vendor/autoload.php';

$pdfFile = __DIR__ . '/Account_statement_2025_11.pdf';

echo "=== TEST EXTRACTION PDF ===\n\n";
echo "Fichier: $pdfFile\n";
echo "Existe: " . (file_exists($pdfFile) ? 'OUI' : 'NON') . "\n";
echo "Taille: " . filesize($pdfFile) . " octets\n\n";

try {
    $parser = new \Smalot\PdfParser\Parser();
    echo "Parser créé avec succès\n";
    
    $pdf = $parser->parseFile($pdfFile);
    echo "PDF parsé avec succès\n";
    
    $text = $pdf->getText();
    echo "Texte extrait: " . strlen($text) . " caractères\n\n";
    
    echo "=== DÉBUT DU TEXTE (2000 premiers caractères) ===\n";
    echo substr($text, 0, 2000) . "\n";
    echo "=== FIN ===\n\n";
    
    // Recherche de dates
    if (preg_match_all('/\d{2}\/\d{2}\/\d{4}/', $text, $matches)) {
        echo "Dates trouvées: " . count($matches[0]) . "\n";
        foreach (array_slice($matches[0], 0, 10) as $date) {
            echo "  - $date\n";
        }
    } else {
        echo "Aucune date trouvée\n";
    }
    
    echo "\n=== Recherche de transactions ===\n";
    $lines = explode("\n", $text);
    echo "Nombre de lignes: " . count($lines) . "\n\n";
    
    $found = 0;
    foreach ($lines as $line) {
        $line = trim($line);
        if (preg_match('/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\+\-])\s*(\d+[,\.]\d{2})/', $line, $match)) {
            echo "Transaction: {$match[1]} | {$match[2]} | {$match[3]}{$match[4]}\n";
            $found++;
            if ($found >= 5) break;
        }
    }
    
    echo "\nTotal transactions trouvées (pattern 1): $found\n";
    
} catch (Exception $e) {
    echo "ERREUR: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
?>
