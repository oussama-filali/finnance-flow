<?php
// backend/Test/TransactionModelTest.php - Tests unitaires pour TransactionModel

require_once '../config.php';
require_once '../TransactionModel.php';

class TransactionModelTest {
    private $model;
    private $testUserId = 1;
    private $testCategoryId;
    private $testSubcategoryId;

    public function __construct() {
        $this->model = new TransactionModel();
        $this->setupTestData();
    }

    private function setupTestData() {
        // Supprimer les anciennes données de test
        global $pdo;
        $pdo->prepare("DELETE FROM transactions WHERE user_id = ? AND title LIKE 'ModelTest%'")->execute([$this->testUserId]);
        $pdo->prepare("DELETE FROM subcategories WHERE name LIKE 'ModelTest%'")->execute();
        $pdo->prepare("DELETE FROM categories WHERE name LIKE 'ModelTest%' AND user_id = ?")->execute([$this->testUserId]);

        // Insérer une catégorie de test
        $pdo->prepare("INSERT INTO categories (name, user_id) VALUES ('ModelTest Category', ?)")->execute([$this->testUserId]);
        $this->testCategoryId = $pdo->lastInsertId();

        // Insérer une sous-catégorie de test
        $pdo->prepare("INSERT INTO subcategories (name, category_id) VALUES ('ModelTest Subcategory', ?)")->execute([$this->testCategoryId]);
        $this->testSubcategoryId = $pdo->lastInsertId();
    }

    public function testCreate() {
        $data = [
            'title' => 'ModelTest Create',
            'description' => 'Test création',
            'amount' => 123.45,
            'date' => '2024-03-01',
            'location' => 'Test City',
            'category_id' => $this->testCategoryId,
            'subcategory_id' => $this->testSubcategoryId
        ];
        $id = $this->model->create($data, $this->testUserId);
        assert(is_numeric($id), 'Création échouée');
        echo "testCreate passed\n";
        return $id;
    }

    public function testGetById() {
        $data = [
            'title' => 'ModelTest GetById',
            'amount' => 67.89,
            'date' => '2024-03-02'
        ];
        $id = $this->model->create($data, $this->testUserId);
        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction['title'] === 'ModelTest GetById', 'Titre incorrect');
        assert($transaction['amount'] == 67.89, 'Montant incorrect');
        echo "testGetById passed\n";
    }

    public function testUpdate() {
        $data = [
            'title' => 'ModelTest Update',
            'amount' => 50.00,
            'date' => '2024-03-03'
        ];
        $id = $this->model->create($data, $this->testUserId);

        $updateData = [
            'title' => 'ModelTest Updated',
            'amount' => 75.00,
            'date' => '2024-03-04'
        ];
        $result = $this->model->update($id, $updateData, $this->testUserId);
        assert($result === 1, 'Update échoué');

        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction['title'] === 'ModelTest Updated', 'Titre non mis à jour');
        echo "testUpdate passed\n";
    }

    public function testDelete() {
        $data = [
            'title' => 'ModelTest Delete',
            'amount' => 25.00,
            'date' => '2024-03-05'
        ];
        $id = $this->model->create($data, $this->testUserId);

        $result = $this->model->delete($id, $this->testUserId);
        assert($result === 1, 'Delete échoué');

        $transaction = $this->model->getById($id, $this->testUserId);
        assert($transaction === false, 'Transaction non supprimée');
        echo "testDelete passed\n";
    }

    public function testGetAll() {
        // Créer quelques transactions
        $this->model->create(['title' => 'ModelTest All 1', 'amount' => 10.00, 'date' => '2024-03-06'], $this->testUserId);
        $this->model->create(['title' => 'ModelTest All 2', 'amount' => 20.00, 'date' => '2024-03-07'], $this->testUserId);

        $transactions = $this->model->getAll($this->testUserId);
        assert(is_array($transactions), 'getAll ne retourne pas un tableau');
        assert(count($transactions) >= 2, 'Pas assez de transactions');
        echo "testGetAll passed\n";
    }

    public function testGetBalance() {
        global $pdo;
        // Nettoyer TOUTES les transactions pour un calcul propre
        $pdo->prepare("DELETE FROM transactions WHERE user_id = ?")->execute([$this->testUserId]);

        $this->model->create(['title' => 'ModelTest Balance +', 'amount' => 500.00, 'date' => '2024-03-08'], $this->testUserId);
        $this->model->create(['title' => 'ModelTest Balance -', 'amount' => -100.00, 'date' => '2024-03-09'], $this->testUserId);

        $balance = $this->model->getBalance($this->testUserId);
        assert($balance == 400.00, 'Solde incorrect : ' . $balance);
        echo "testGetBalance passed\n";
    }
}

// Exécuter les tests
$test = new TransactionModelTest();
$test->testCreate();
$test->testGetById();
$test->testUpdate();
$test->testDelete();
$test->testGetAll();
$test->testGetBalance();

echo "Tous les tests TransactionModel passés !\n";
?>