<?php
// TransactionControllerTest.php - Tests unitaires pour TransactionController
require_once 'config.php';
require_once 'TransactionModel.php';
require_once 'TransactionController.php';

class TransactionControllerTest {
    private $controller;
    private $model;
    private $testUserId = 1;


    public function __construct() {
        // Simuler une session utilisateur
        $_SESSION['user_id'] = $this->testUserId;
        $this->controller = new TransactionController();
        $this->model = new TransactionModel();
    }

    public function testCreateTransaction() {
        $data = [
            'title' => 'Test Transaction',
            'description' => 'Description de test',
            'amount' => 100.50,
            'date' => '2024-01-01',
            'location' => 'Paris',
            'category_id' => 1,
            'subcategory_id' => 1
        ];
        $id = $this->model->create($data, $this->testUserId);
        assert(is_numeric($id), 'Création de transaction échouée');
        echo "testCreateTransaction passed\n";
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

    // Ajouter d'autres tests pour update, delete, getAll, getBalance...

}




?>