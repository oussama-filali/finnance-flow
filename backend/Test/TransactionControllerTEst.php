<?php
// backend/Test/TransactionControllerTest.php - Tests unitaires pour TransactionController

require_once '../config.php';
require_once '../TransactionModel.php';
require_once '../TransactionController.php';

class TransactionControllerTest {
    private $controller;
    private $model;
    private $testUserId = 1;

    public function __construct() {
        // Démarrer session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Simuler une session utilisateur
        $_SESSION['user_id'] = $this->testUserId;

        $this->controller = new TransactionController();
        $this->model = new TransactionModel();

        // Insérer des données de test
        $this->setupTestData();
    }

    private function setupTestData() {
        global $pdo;
        // Supprimer les anciennes données de test
        $pdo->prepare("DELETE FROM transactions WHERE user_id = ? AND title LIKE 'Test%'")->execute([$this->testUserId]);
        $pdo->prepare("DELETE FROM subcategories WHERE name LIKE 'Test%'")->execute();
        $pdo->prepare("DELETE FROM categories WHERE name LIKE 'Test%' AND user_id = ?")->execute([$this->testUserId]);

        // Insérer une catégorie de test
        $pdo->prepare("INSERT INTO categories (name, user_id) VALUES ('Test Category', ?)")->execute([$this->testUserId]);
        $categoryId = $pdo->lastInsertId();

        // Insérer une sous-catégorie de test
        $pdo->prepare("INSERT INTO subcategories (name, category_id) VALUES ('Test Subcategory', ?)")->execute([$categoryId]);
        $subcategoryId = $pdo->lastInsertId();

        $this->testCategoryId = $categoryId;
        $this->testSubcategoryId = $subcategoryId;
    }

    public function testCreateTransaction() {
        $data = [
            'title' => 'Test Transaction',
            'description' => 'Description de test',
            'amount' => 100.50,
            'date' => '2024-01-01',
            'location' => 'Paris',
            'category_id' => $this->testCategoryId,
            'subcategory_id' => $this->testSubcategoryId
        ];
        $id = $this->model->create($data, $this->testUserId);
        assert(is_numeric($id), 'Création de transaction échouée');
        echo "testCreateTransaction passed\n";
        return $id; // Retourner l'ID pour les autres tests
    }

    public function testGetTransactionById() {
        $data = [
            'title' => 'Test Get By ID',
            'amount' => 50.00,
            'date' => '2024-02-01'
        ];
        $id = $this->model->create($data, $this->testUserId);
        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction['title'] === 'Test Get By ID', 'Récupération par ID échouée');
        echo "testGetTransactionById passed\n";
    }

    public function testUpdateTransaction() {
        $data = [
            'title' => 'Test Update',
            'amount' => 75.00,
            'date' => '2024-02-01'
        ];
        $id = $this->model->create($data, $this->testUserId);

        $updateData = [
            'title' => 'Test Updated',
            'amount' => 100.00,
            'date' => '2024-02-02'
        ];
        $updated = $this->model->update($id, $updateData, $this->testUserId);
        assert($updated === 1, 'Mise à jour échouée');

        // Vérifier que la mise à jour a fonctionné
        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction['title'] === 'Test Updated', 'Titre non mis à jour');
        assert($transaction['amount'] == 100.00, 'Montant non mis à jour');
        echo "testUpdateTransaction passed\n";
    }

    public function testDeleteTransaction() {
        $data = [
            'title' => 'Test Delete',
            'amount' => 25.00,
            'date' => '2024-02-01'
        ];
        $id = $this->model->create($data, $this->testUserId);

        $deleted = $this->model->delete($id, $this->testUserId);
        assert($deleted === 1, 'Suppression échouée');

        // Vérifier que la transaction n'existe plus
        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction === false, 'Transaction non supprimée');
        echo "testDeleteTransaction passed\n";
    }

    public function testGetAllTransactions() {
        // Créer quelques transactions de test
        $this->model->create(['title' => 'Test All 1', 'amount' => 10.00, 'date' => '2024-01-01'], $this->testUserId);
        $this->model->create(['title' => 'Test All 2', 'amount' => 20.00, 'date' => '2024-01-02'], $this->testUserId);

        $transactions = $this->model->getAll($this->testUserId);
        assert(is_array($transactions), 'getAll ne retourne pas un tableau');
        assert(count($transactions) >= 2, 'Pas assez de transactions retournées');
        echo "testGetAllTransactions passed\n";
    }

    public function testGetBalance() {
        global $pdo;
        // Supprimer les anciennes transactions pour un calcul propre
        $pdo->prepare("DELETE FROM transactions WHERE user_id = ? AND title LIKE 'Test%'")->execute([$this->testUserId]);

        // Créer des transactions avec montants positifs et négatifs
        $this->model->create(['title' => 'Revenus', 'amount' => 1000.00, 'date' => '2024-01-01'], $this->testUserId);
        $this->model->create(['title' => 'Dépenses', 'amount' => -200.00, 'date' => '2024-01-02'], $this->testUserId);

        $balance = $this->model->getBalance($this->testUserId);
        assert($balance == 800.00, 'Solde incorrect : ' . $balance);
        echo "testGetBalance passed\n";
    }
}

// Exécuter les tests
$test = new TransactionControllerTest();
$test->testCreateTransaction();
$test->testGetTransactionById();
$test->testUpdateTransaction();
$test->testDeleteTransaction();
$test->testGetAllTransactions();
$test->testGetBalance();

echo "Tous les tests TransactionController passés !\n";
?>