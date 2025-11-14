<?php
// backend/Test/IndexTest.php - Test basique pour index.php

// Test que le fichier index.php peut être inclus sans erreur fatale
try {
    // Simuler une requête GET /transactions
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/transactions';

    // Démarrer session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['user_id'] = 1; // Simuler utilisateur connecté

    // Capturer la sortie
    ob_start();
    require_once '../index.php';
    $output = ob_get_clean();

    // Vérifier que c'est du JSON
    $result = json_decode($output, true);
    if ($result !== null) {
        echo "IndexTest passed - JSON valide retourné\n";
    } else {
        echo "IndexTest failed - Pas de JSON valide\n";
    }

} catch (Exception $e) {
    echo "IndexTest failed - Erreur : " . $e->getMessage() . "\n";
}
?>