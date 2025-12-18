<?php
// CategoryController.php - Gestion des catégories

require_once 'config.php';

class CategoryController {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function index() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT * FROM categories WHERE user_id IS NULL OR user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($categories);
    }

    public function subcategories($categoryId) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT * FROM subcategories WHERE category_id = ?");
        $stmt->execute([$categoryId]);
        $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($subcategories);
    }

    public function create() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Nom requis']);
            return;
        }

        $stmt = $this->pdo->prepare("INSERT INTO categories (name, user_id) VALUES (?, ?)");
        $stmt->execute([$data['name'], $_SESSION['user_id']]);
        
        echo json_encode([
            'id' => $this->pdo->lastInsertId(),
            'message' => 'Catégorie créée'
        ]);
    }
}
