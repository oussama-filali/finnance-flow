<?php
// config.php - Configuration DB et app

error_reporting(0);
ini_set('display_errors', '0');

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'financeflow';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;port=3307;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur DB: " . $e->getMessage());
}

// Configuration session pour CORS
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', 'true');

// Démarrer session pour auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}