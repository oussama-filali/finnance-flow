<?php
// TransactionModel.php - Accès données transactions

require_once 'config.php';

class TransactionModel {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function getAll($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id, $userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data, $userId) {
        $stmt = $this->pdo->prepare("INSERT INTO transactions (user_id, title, description, amount, date, location, category_id, subcategory_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $data['title'], $data['description'] ?? null, $data['amount'], $data['date'], $data['location'] ?? null, $data['category_id'] ?? null, $data['subcategory_id'] ?? null]);
        return $this->pdo->lastInsertId();
    }

    public function update($id, $data, $userId) {
        $stmt = $this->pdo->prepare("UPDATE transactions SET title = ?, description = ?, amount = ?, date = ?, location = ?, category_id = ?, subcategory_id = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['title'], $data['description'] ?? null, $data['amount'], $data['date'], $data['location'] ?? null, $data['category_id'] ?? null, $data['subcategory_id'] ?? null, $id, $userId]);
        return $stmt->rowCount();
    }

    public function delete($id, $userId) {
        $stmt = $this->pdo->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
        return $stmt->rowCount();
    }

    public function getBalance($userId) {
        $stmt = $this->pdo->prepare("SELECT SUM(amount) as balance FROM transactions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['balance'] ?? 0;
    }
}
?>