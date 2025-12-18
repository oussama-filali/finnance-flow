<?php
// TransactionController.php - Logique métier transactions

require_once 'TransactionModel.php';

class TransactionController {
    private $model;

    public function __construct() {
        $this->model = new TransactionModel();
        $this->userId = $_SESSION['user_id'] ?? null;
    }
    
    private function checkAuth() {
        if (!$this->userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
    }

    public function index() {
        $this->checkAuth();
        $transactions = $this->model->getAll($this->userId);
        echo json_encode($transactions);
    }

    public function show($id) {
        $this->checkAuth();
        $transaction = $this->model->getById($id, $this->userId);
        if ($transaction) {
            echo json_encode($transaction);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
        }
    }

    public function store() {
        $this->checkAuth();
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['title'], $data['amount'], $data['date'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Données invalides']);
                return;
            }
            
            // Convertir category_id vide en NULL
            if (isset($data['category_id']) && $data['category_id'] === '') {
                $data['category_id'] = null;
            }
            
            $id = $this->model->create($data, $this->userId);
            echo json_encode(['id' => $id, 'message' => 'Transaction créée']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $this->checkAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title'], $data['amount'], $data['date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }

        // Vérifier si la transaction existe et appartient à l'utilisateur
        $existing = $this->model->getById($id, $this->userId);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
            return;
        }

        // Convertir category_id vide en NULL
        if (isset($data['category_id']) && $data['category_id'] === '') {
            $data['category_id'] = null;
        }

        $this->model->update($id, $data, $this->userId);
        // On retourne succès même si rowCount est 0 (pas de changement)
        echo json_encode(['message' => 'Transaction mise à jour']);
    }

    public function destroy($id) {
        $this->checkAuth();
        $deleted = $this->model->delete($id, $this->userId);
        if ($deleted) {
            echo json_encode(['message' => 'Transaction supprimée']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
        }
    }

    public function balance() {
        $this->checkAuth();
        $balance = $this->model->getBalance($this->userId);
        echo json_encode(['balance' => $balance]);
    }
}