<?php
// TransactionController.php - Logique métier transactions

require_once 'TransactionModel.php';

class TransactionController {
    private $model;

    public function __construct() {
        $this->model = new TransactionModel();
        // Auth basique : vérifier session user_id
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        $this->userId = $_SESSION['user_id'];
    }

    public function index() {
        $transactions = $this->model->getAll($this->userId);
        echo json_encode($transactions);
    }

    public function show($id) {
        $transaction = $this->model->getById($id, $this->userId);
        if ($transaction) {
            echo json_encode($transaction);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
        }
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title'], $data['amount'], $data['date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }
        $id = $this->model->create($data, $this->userId);
        echo json_encode(['id' => $id, 'message' => 'Transaction créée']);
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['title'], $data['amount'], $data['date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Données invalides']);
            return;
        }
        $updated = $this->model->update($id, $data, $this->userId);
        if ($updated) {
            echo json_encode(['message' => 'Transaction mise à jour']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
        }
    }

    public function destroy($id) {
        $deleted = $this->model->delete($id, $this->userId);
        if ($deleted) {
            echo json_encode(['message' => 'Transaction supprimée']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Transaction non trouvée']);
        }
    }

    public function balance() {
        $balance = $this->model->getBalance($this->userId);
        echo json_encode(['balance' => $balance]);
    }
}
?>