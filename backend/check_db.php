<?php
// Vérification directe de ce qui est en base
require_once 'config.php';

header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Vérification BDD</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #0f0; padding: 8px; text-align: left; }
        th { background: #003300; }
        .info { color: #0ff; }
        .error { color: #f00; }
    </style>
</head>
<body>
    <h1>🔍 Vérification Base de Données</h1>
    
    <?php
    if (!isset($_SESSION['user_id'])) {
        echo "<p class='error'>⚠️ Vous n'êtes pas connecté. ID utilisateur: AUCUN</p>";
        echo "<p>Connectez-vous d'abord sur l'interface principale.</p>";
    } else {
        echo "<p class='info'>✅ Connecté en tant qu'utilisateur ID: " . $_SESSION['user_id'] . "</p>";
        
        // Compter les transactions
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM transactions WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<h2>📊 Statistiques</h2>";
        echo "<p class='info'>Total transactions: " . $count['total'] . "</p>";
        
        // Afficher les dernières transactions
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
        $stmt->execute([$_SESSION['user_id']]);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h2>📋 Dernières 20 transactions</h2>";
        
        if (empty($transactions)) {
            echo "<p class='error'>❌ Aucune transaction trouvée en base !</p>";
        } else {
            echo "<table>";
            echo "<tr><th>ID</th><th>Date</th><th>Titre</th><th>Montant</th><th>Catégorie</th><th>Créé le</th></tr>";
            
            foreach ($transactions as $t) {
                echo "<tr>";
                echo "<td>" . $t['id'] . "</td>";
                echo "<td>" . $t['date'] . "</td>";
                echo "<td>" . htmlspecialchars($t['title']) . "</td>";
                echo "<td>" . $t['amount'] . " €</td>";
                echo "<td>" . ($t['category_id'] ?: 'Aucune') . "</td>";
                echo "<td>" . $t['created_at'] . "</td>";
                echo "</tr>";
            }
            
            echo "</table>";
        }
        
        // Vérifier les transactions créées dans les 5 dernières minutes
        $stmt = $pdo->prepare("SELECT COUNT(*) as recent FROM transactions WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
        $stmt->execute([$_SESSION['user_id']]);
        $recent = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<p class='info'>Transactions créées dans les 5 dernières minutes: " . $recent['recent'] . "</p>";
        
        if ($recent['recent'] == 0) {
            echo "<p class='error'>⚠️ Aucune transaction récente ! L'import n'a pas fonctionné.</p>";
        } else {
            echo "<p class='info'>✅ Des transactions ont été importées récemment !</p>";
        }
    }
    ?>
    
    <h2>🔧 Actions de debug</h2>
    <ul>
        <li><a href="debug_import.php">Voir les logs d'import</a></li>
        <li><a href="http://localhost:5173">Retour à l'interface</a></li>
        <li><a href="javascript:location.reload()">🔄 Rafraîchir cette page</a></li>
    </ul>
    
    <h2>📝 Test SQL direct</h2>
    <?php
    // Vérifier la structure de la table
    $stmt = $pdo->query("DESCRIBE transactions");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p>Colonnes de la table 'transactions':</p>";
    echo "<table>";
    echo "<tr><th>Champ</th><th>Type</th><th>Null</th><th>Clé</th><th>Défaut</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . $col['Field'] . "</td>";
        echo "<td>" . $col['Type'] . "</td>";
        echo "<td>" . $col['Null'] . "</td>";
        echo "<td>" . $col['Key'] . "</td>";
        echo "<td>" . ($col['Default'] ?: 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    ?>
</body>
</html>
