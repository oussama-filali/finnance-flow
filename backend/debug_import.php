<?php
// Page de debug pour voir les logs d'import
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Debug Import PDF</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .log { background: #000; padding: 10px; margin: 10px 0; border-left: 3px solid #0f0; }
        .error { border-left-color: #f00; color: #f00; }
        .info { border-left-color: #00f; color: #0ff; }
        h1 { color: #0f0; }
        pre { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>📋 Debug Import PDF</h1>
    
    <h2>Logs PHP (dernières 50 lignes)</h2>
    <?php
    $logFile = 'C:/wamp64/logs/php_error.log';
    if (file_exists($logFile)) {
        $lines = file($logFile);
        $importLogs = array_filter($lines, function($line) {
            return stripos($line, 'import') !== false || 
                   stripos($line, 'pdf') !== false ||
                   stripos($line, 'transaction') !== false;
        });
        
        $lastLogs = array_slice($importLogs, -50);
        
        foreach ($lastLogs as $log) {
            $class = 'log';
            if (stripos($log, 'error') !== false) $class .= ' error';
            if (stripos($log, 'extrait') !== false) $class .= ' info';
            
            echo "<div class='$class'>" . htmlspecialchars($log) . "</div>";
        }
        
        if (empty($lastLogs)) {
            echo "<div class='log'>Aucun log d'import trouvé</div>";
        }
    } else {
        echo "<div class='log error'>Fichier log non trouvé: $logFile</div>";
    }
    ?>
    
    <h2>Test rapide</h2>
    <form method="POST" enctype="multipart/form-data">
        <input type="file" name="testfile" accept=".pdf">
        <button type="submit">Tester extraction</button>
    </form>
    
    <?php
    if (isset($_FILES['testfile'])) {
        echo "<h3>Résultat test</h3>";
        $tmpFile = $_FILES['testfile']['tmp_name'];
        
        echo "<div class='log info'>Fichier: " . $_FILES['testfile']['name'] . "</div>";
        echo "<div class='log info'>Taille: " . filesize($tmpFile) . " octets</div>";
        
        $content = file_get_contents($tmpFile);
        echo "<div class='log info'>Contenu lu: " . strlen($content) . " octets</div>";
        
        // Extraire texte
        if (preg_match_all('/\((.*?)\)/s', $content, $matches)) {
            echo "<div class='log info'>Parenthèses: " . count($matches[1]) . "</div>";
            
            $text = '';
            foreach (array_slice($matches[1], 0, 100) as $match) {
                $decoded = '';
                for ($i = 0; $i < strlen($match); $i++) {
                    $char = $match[$i];
                    if ($char === '\\') { $i++; continue; }
                    $decoded .= $char;
                }
                $text .= $decoded . ' ';
            }
            
            echo "<div class='log'>Texte extrait (200 premiers caractères):<pre>" . 
                 htmlspecialchars(substr($text, 0, 200)) . "</pre></div>";
            
            // Chercher dates
            if (preg_match_all('/\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}/', $text, $dates)) {
                echo "<div class='log info'>Dates trouvées: " . count($dates[0]) . "</div>";
                echo "<div class='log'><pre>" . print_r(array_slice($dates[0], 0, 10), true) . "</pre></div>";
            }
        }
    }
    ?>
    
    <p><a href="javascript:location.reload()">🔄 Rafraîchir</a></p>
</body>
</html>
