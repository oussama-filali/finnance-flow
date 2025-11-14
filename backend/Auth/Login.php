<?php
// backend/login.php — Authentification utilisateur

require_once 'config.php';

if (php_sapi_name() === 'cli') {
    // Mode CLI : utiliser une variable globale pour injecter les données de test
    global $test_login_data;
    $data = $test_login_data ?? [];
} else {
    // Mode HTTP classique
    $data = json_decode(file_get_contents('php://input'), true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    // Vérifier que l'utilisateur existe
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // Auth OK : stocker l'id utilisateur en session
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['success' => true, 'message' => 'Connexion réussie']);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}