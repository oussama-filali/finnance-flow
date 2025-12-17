<?php
// backend/Auth/Register.php — Inscription utilisateur

require_once __DIR__ . '/../config.php';

if (php_sapi_name() === 'cli') {
    global $test_register_data;
    $data = $test_register_data ?? [];
} else {
    $data = json_decode(file_get_contents('php://input'), true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || php_sapi_name() === 'cli') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    // Validation
    if (strlen($username) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le nom d\'utilisateur doit contenir au moins 3 caractères']);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères']);
        exit;
    }

    // Vérifier si l'utilisateur existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Ce nom d\'utilisateur existe déjà']);
        exit;
    }

    // Créer l'utilisateur
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    
    if ($stmt->execute([$username, $passwordHash])) {
        $userId = $pdo->lastInsertId();
        
        // Empêche le warning "session already started"
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['user_id'] = $userId;
        $user = ['id' => $userId, 'username' => $username];
        echo json_encode(['success' => true, 'message' => 'Compte créé avec succès', 'user' => $user]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la création du compte']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
?>
