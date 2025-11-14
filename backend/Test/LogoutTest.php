<?php

// Désactiver les warnings pour ne pas polluer la sortie JSON
error_reporting(E_ERROR | E_PARSE);

session_start();
$_SESSION['user_id'] = 1;

ob_start();
require_once '../backend/Auth/Logout.php';
$output = ob_get_clean();

// Nettoyer l’output (enlever espaces, retours, notices accidentelles)
$output = trim($output);

// Vérification JSON valide
$result = json_decode($output, true);

if (!$result) {
    throw new Exception("Le script Logout n'a pas retourné du JSON valide. Output : " . $output);
}

if ($result['success'] !== true) {
    throw new Exception("Échec : success devrait être true");
}

if ($result['message'] !== 'Déconnexion réussie') {
    throw new Exception("Échec : message incorrect");
}

echo "LogoutTest passed\n";
