<?php
// backend/login.php — Authentification utilisateur

require_once __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    // Vérifier que l'utilisateur existe
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        // Empêche le warning "session already started"
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Auth OK : stocker l'id utilisateur en session
        $_SESSION['user_id'] = $user['id'];
        unset($user['password_hash']);
        echo json_encode(['success' => true, 'message' => 'Connexion réussie', 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Identifiants invalides']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}