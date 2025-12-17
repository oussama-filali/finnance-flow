<?php
// UserController.php - Gestion des utilisateurs

require_once 'config.php';

class UserController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function profile() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT id, username, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Utilisateur non trouvé']);
        }
    }

    public function updateProfile() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['username'])) {
            $stmt = $this->pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt->execute([$data['username'], $_SESSION['user_id']]);
            echo json_encode(['message' => 'Profil mis à jour']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
        }
    }
}
?>
