<?php
error_reporting(0);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Headers de sécurité
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Fichiers requis
require_once 'config.php';
require_once 'TransactionController.php';
require_once 'UserController.php';
require_once 'CategoryController.php';
require_once 'ImportController.php';

// Récupération de la méthode HTTP et du chemin
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'])['path'] ?? '';
$path = trim($path, '/');

$segments = explode('/', $path);

// S'assurer que la réponse est en JSON
header("Content-Type: application/json; charset=UTF-8");

// Routing simple
try {
    // Routes d'authentification
    if ($segments[0] === 'Auth' && isset($segments[1])) {
        $authFile = __DIR__ . '/Auth/' . $segments[1];
        if (file_exists($authFile)) {
            require_once $authFile;
            exit;
        }
    }

    // Routes des transactions
    if ($segments[0] === 'transactions' || $path === 'transactions') {
        $controller = new TransactionController();
        
        switch ($method) {
            case 'GET':
                if (isset($segments[1])) {
                    if ($segments[1] === 'balance') {
                        $controller->balance();
                    } else {
                        $controller->show($segments[1]);
                    }
                } else {
                    $controller->index();
                }
                break;
            
            case 'POST':
                $controller->store();
                break;
            
            case 'PUT':
                if (isset($segments[1])) {
                    $controller->update($segments[1]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis']);
                }
                break;
            
            case 'DELETE':
                if (isset($segments[1])) {
                    $controller->destroy($segments[1]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis']);
                }
                break;
            
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }

    // Route d'import CSV, PDF, Images
    if ($segments[0] === 'import' && isset($segments[1]) && $segments[1] === 'transactions' && $method === 'POST') {
        $controller = new ImportController();
        $controller->handleRequest();
        exit;
    }

    // Routes des catégories
    if ($segments[0] === 'categories') {
        $controller = new CategoryController();
        
        switch ($method) {
            case 'GET':
                if (isset($segments[1]) && isset($segments[2]) && $segments[2] === 'subcategories') {
                    $controller->subcategories($segments[1]);
                } else {
                    $controller->index();
                }
                break;
            
            case 'POST':
                $controller->create();
                break;
            
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }

    // Routes des utilisateurs
    if ($segments[0] === 'user') {
        $controller = new UserController();
        
        switch ($method) {
            case 'GET':
                $controller->profile();
                break;
            
            case 'PUT':
                $controller->updateProfile();
                break;
            
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }

    // Route par défaut
    http_response_code(404);
    echo json_encode(['error' => 'Route non trouvée', 'path' => $path]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur', 'message' => $e->getMessage()]);
}
