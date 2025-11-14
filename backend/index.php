<?php
// index.php - Point d'entrée API

//headers pour les CORS et JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Pour les fichiers requis
require_once 'config.php';
require_once 'TransactionController.php';
require_once 'UserController.php';
require_once 'CategoryController.php';

// recuperation de la methode http et du chemin
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI']) ? trim(parse_url($_SERVER['REQUEST_URI'])['path'], '/') : '';

$segments = explode('/', $path);

