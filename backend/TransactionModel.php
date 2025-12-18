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
        try {
            error_log("TransactionModel::create appelé - User: $userId, Titre: " . ($data['title'] ?? 'N/A'));
            
            $stmt = $this->pdo->prepare("INSERT INTO transactions (user_id, title, description, amount, date, location, category_id, subcategory_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([
                $userId, 
                $data['title'], 
                $data['description'] ?? null, 
                floatval($data['amount']), 
                $data['date'], 
                $data['location'] ?? null, 
                $data['category_id'] ?? null, 
                $data['subcategory_text'] ?? null
            ]);
            
            $insertId = $this->pdo->lastInsertId();
            error_log("TransactionModel::create réussi - ID: $insertId");
            
            return $insertId;
        } catch (PDOException $e) {
            error_log("Transaction create error: " . $e->getMessage());
            error_log("Data: " . json_encode($data));
            throw $e;
        }
    }

    public function update($id, $data, $userId) {
        try {
            $stmt = $this->pdo->prepare("UPDATE transactions SET title = ?, description = ?, amount = ?, date = ?, location = ?, category_id = ?, subcategory_text = ? WHERE id = ? AND user_id = ?");
            $stmt->execute([
                $data['title'], 
                $data['description'] ?? null, 
                floatval($data['amount']), 
                $data['date'], 
                $data['location'] ?? null, 
                $data['category_id'] ?? null, 
                $data['subcategory_text'] ?? null, 
                $id, 
                $userId
            ]);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Transaction update error: " . $e->getMessage());
            throw $e;
        }
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