<?php

// Désactiver les warnings pour ne pas polluer le JSON
error_reporting(E_ERROR | E_PARSE);

// Simuler un POST
$_SERVER['REQUEST_METHOD'] = 'POST';

// Démarrer la session pour éviter warning
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Insérer un utilisateur de test dans la base
require_once __DIR__ . '/../config.php';
$username = 'testuser';
$password = 'password';
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Supprimer l'utilisateur s'il existe déjà
$pdo->prepare("DELETE FROM users WHERE username = ?")->execute([$username]);

// Insérer l'utilisateur
$pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")->execute([$username, $password_hash]);

// Préparer les données de test
global $test_login_data;
$test_login_data = [
    'username' => $username,
    'password' => $password
];

// Capture de sortie
ob_start();

// Chemin correct
require_once __DIR__ . '/../Auth/Login.php';

$output = ob_get_clean();

// Nettoyer sortie (par sécurité)
$output = trim($output);

// Décode JSON
$result = json_decode($output, true);

if (!$result) {
    throw new Exception("JSON invalide. Output : " . $output);
}

if ($result['success'] !== true) {
    throw new Exception("Échec login : success != true");
}

if ($result['message'] !== 'Connexion réussie') {
    throw new Exception("Message incorrect");
}

if (!isset($_SESSION['user_id'])) {
    throw new Exception("user_id non créé dans la session !");
}

echo "LoginTest passed\n";
