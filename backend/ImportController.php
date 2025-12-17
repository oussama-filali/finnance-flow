<?php
require_once __DIR__ . '/TransactionModel.php';
require_once __DIR__ . '/KeywordMatcher.php';

class ImportController {
    private $matcher;

    public function __construct() {
        $this->matcher = new KeywordMatcher();
    }

    public function handleRequest() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Non autorisé']);
            return;
        }
        $userId = $_SESSION['user_id'];

        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Fichier manquant']);
            return;
        }

        $filename = $_FILES['file']['name'];
        $tmpName = $_FILES['file']['tmp_name'];
        $fileSize = $_FILES['file']['size'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // Limite de taille : 10MB
        if ($fileSize > 10 * 1024 * 1024) {
            http_response_code(413);
            echo json_encode(['error' => 'Fichier trop volumineux (max 10MB)']);
            return;
        }
        
        error_log("Import fichier: $filename (ext: $ext, size: $fileSize, tmp: $tmpName)");
        
        // Validation MIME type basique
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $tmpName);
        finfo_close($finfo);

        error_log("MIME détecté: $mime");

        $allowedMimes = [
            'application/pdf', 
            'text/csv', 
            'text/plain', 
            'application/vnd.ms-excel',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];

        if (!in_array($mime, $allowedMimes) && $ext !== 'csv') {
            http_response_code(400);
            echo json_encode(['error' => "Type de fichier invalide ($mime)"]);
            return;
        }
        
        if ($ext === 'pdf') {
            error_log("Appel importPDF");
            $result = $this->importPDF($tmpName, $userId);
        } elseif (in_array($ext, ['csv', 'txt'])) {
            error_log("Appel importCSV");
            $result = $this->importCSV($tmpName, $userId);
        } elseif (in_array($ext, ['png', 'jpg', 'jpeg'])) {
            error_log("Appel importImage");
            $result = $this->importImage($tmpName, $userId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Format non supporté']);
            return;
        }

        error_log("Résultat import: " . json_encode($result));
        echo json_encode($result);
    }

    private function importPDF($file, $userId) {
        $text = $this->extractPDFText($file);
        
        if (!$text) {
            return ['error' => 'Impossible de lire le PDF', 'imported' => 0];
        }

        $transactions = $this->parseText($text);
        
        $model = new TransactionModel();
        $imported = 0;

        foreach ($transactions as $data) {
            $data['category_id'] = $this->matcher->detect($data['title'], $data['description']);
            $model->create($data, $userId);
            $imported++;
        }

        return ['imported' => $imported];
    }

    private function importImage($file, $userId) {
        $text = $this->extractImageText($file);
        if (!$text) {
            return ['error' => 'Impossible de lire l\'image', 'imported' => 0];
        }

        $transactions = $this->parseText($text);
        $model = new TransactionModel();
        $imported = 0;

        foreach ($transactions as $data) {
            $data['category_id'] = $this->matcher->detect($data['title'], $data['description']);
            $model->create($data, $userId);
            $imported++;
        }

        return ['imported' => $imported];
    }

    private function extractImageText($file) {
        if (!extension_loaded('gd')) {
            return "Extraction d'image non disponible";
        }

        $content = @file_get_contents($file);
        if (!$content) return null;

        $text = '';
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line) && preg_match('/[a-zA-Z0-9]/', $line)) {
                $text .= $line . "\n";
            }
        }

        if (empty(trim($text))) {
            $text = "Image uploadee - extraction de texte en attente";
        }

        return trim($text) ?: null;
    }

    private function extractPDFText($file) {
        error_log("Extraction PDF: $file");
        
        // Solution avec smalot/pdfparser
        if (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require_once __DIR__ . '/vendor/autoload.php';
            
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($file);
                $text = $pdf->getText();
                error_log("PDFParser: extrait " . strlen($text) . " caractères");
                if (!empty(trim($text))) {
                    return trim($text);
                }
            } catch (Exception $e) {
                error_log("Erreur extraction PDF avec parser: " . $e->getMessage());
            }
        } else {
            error_log("PDFParser non disponible, utilisation fallback");
        }
        
        // Fallback: extraction basique
        $content = @file_get_contents($file);
        if (!$content) {
            error_log("Impossible de lire le fichier PDF");
            return null;
        }
        
        error_log("Fichier PDF lu: " . strlen($content) . " octets");
        
        $text = '';
        
        // Extraction texte entre parenthèses
        if (preg_match_all('/\((.*?)\)/s', $content, $matches)) {
            error_log("Parenthèses trouvées: " . count($matches[1]));
            foreach ($matches[1] as $match) {
                $decoded = '';
                for ($i = 0; $i < strlen($match); $i++) {
                    $char = $match[$i];
                    if ($char === '\\') {
                        $i++;
                        continue;
                    }
                    $decoded .= $char;
                }
                $text .= $decoded . ' ';
            }
        }
        
        // Extraction texte entre crochets
        if (preg_match_all('/\[(.*?)\]/s', $content, $matches)) {
            error_log("Crochets trouvés: " . count($matches[1]));
            foreach ($matches[1] as $match) {
                $cleaned = str_replace(['(', ')'], '', $match);
                $text .= $cleaned . ' ';
            }
        }
        
        $finalText = trim($text);
        error_log("Texte extrait (fallback): " . strlen($finalText) . " caractères");
        
        if (!empty($finalText)) {
            error_log("Extrait début: " . substr($finalText, 0, 200));
        }
        
        return $finalText ?: null;
    }

    private function parseText($text) {
        $transactions = [];
        $lines = explode("\n", $text);
        
        error_log("ParseText - Nombre de lignes: " . count($lines));
        
        // Parsing pour relevés BLING (format multiligne)
        $i = 0;
        while ($i < count($lines)) {
            $line = trim($lines[$i]);
            
            // Ligne avec date et type d'opération
            if (preg_match('/^(\d{2}\/\d{2}\/\d{4})\s+(.+)$/', $line, $match)) {
                $date = $this->normalizeDate($match[1]);
                $type = trim($match[2]);
                $i++;
                
                // Lire les lignes suivantes pour le titre/description et montant
                $description = '';
                $amount = null;
                
                while ($i < count($lines)) {
                    $nextLine = trim($lines[$i]);
                    
                    // Si on trouve un montant, c'est la fin de cette transaction
                    if (preg_match('/^([\+\-])\s*(\d+[,\.]\d{2})\s*EUR$/i', $nextLine, $amountMatch)) {
                        $sign = $amountMatch[1];
                        $amountStr = str_replace(',', '.', $amountMatch[2]);
                        $amount = floatval($amountStr) * ($sign === '-' ? -1 : 1);
                        $i++;
                        break;
                    }
                    // Si on trouve une nouvelle date, on arrête (transaction sans montant)
                    elseif (preg_match('/^\d{2}\/\d{2}\/\d{4}\s+/', $nextLine)) {
                        break;
                    }
                    // Sinon c'est une ligne de description
                    else {
                        if (!empty($nextLine)) {
                            $description .= ($description ? ' ' : '') . $nextLine;
                        }
                        $i++;
                    }
                }
                
                // Créer la transaction si on a un montant
                if ($amount !== null) {
                    $title = !empty($description) ? $description : $type;
                    
                    // Nettoyer et limiter le titre
                    $title = preg_replace('/\s+/', ' ', trim($title));
                    if (empty($title)) $title = $type;
                    if (strlen($title) > 100) $title = substr($title, 0, 100);
                    
                    error_log("Transaction trouvée: $date | $title | $amount");
                    
                    $transactions[] = [
                        'title' => $title,
                        'description' => $type,
                        'amount' => $amount,
                        'date' => $date,
                        'location' => null,
                        'category_id' => null
                    ];
                }
            } else {
                $i++;
            }
        }
        
        error_log("Total transactions extraites: " . count($transactions));
        return $transactions;
    }

    private function importCSV($file, $userId) {
        $handle = fopen($file, 'r');
        if (!$handle) {
            return ['error' => 'Impossible de lire le fichier', 'imported' => 0];
        }

        $firstLine = fgets($handle);
        $sep = (strpos($firstLine, ';') !== false) ? ';' : ',';
        fseek($handle, 0);

        $headers = fgetcsv($handle, 0, $sep);
        
        $map = $this->normalizeHeaders($headers);
        $model = new TransactionModel();
        $imported = 0;

        while (($row = fgetcsv($handle, 0, $sep)) !== false) {
            $data = $this->rowToTransaction($row, $map);
            if (!$data) continue;
            
            $data['category_id'] = $this->matcher->detect($data['title'], $data['description']);
            $model->create($data, $userId);
            $imported++;
        }
        fclose($handle);

        return ['imported' => $imported];
    }

    private function normalizeHeaders($headers) {
        $map = [];
        foreach ($headers as $i => $h) {
            $k = strtolower(trim($h));
            $k = str_replace([' ', '-', '_'], '', $k);
            $map[$k] = $i;
        }
        return $map;
    }

    private function rowToTransaction($row, $map) {
        $dateIdx = $map['date'] ?? $map['transactiondate'] ?? null;
        $titleIdx = $map['title'] ?? $map['label'] ?? $map['description'] ?? $map['libelle'] ?? null;
        $amountIdx = $map['amount'] ?? $map['montant'] ?? null;
        $locIdx = $map['location'] ?? $map['merchant'] ?? $map['lieu'] ?? null;

        if ($amountIdx === null || $dateIdx === null) return null;

        $title = $titleIdx !== null ? ($row[$titleIdx] ?? 'Transaction') : 'Transaction';
        $date = $this->normalizeDate($row[$dateIdx] ?? date('Y-m-d'));
        $amountRaw = str_replace(['€', ' ', ','], ['', '', '.'], $row[$amountIdx] ?? '0');
        $amount = floatval($amountRaw);
        $location = $locIdx !== null ? ($row[$locIdx] ?? null) : null;

        return [
            'title' => $title,
            'description' => null,
            'amount' => $amount,
            'date' => $date,
            'location' => $location,
            'category_id' => null
        ];
    }

    private function normalizeDate($date) {
        $date = preg_replace('/[\/.\-]/', '-', $date);
        if (preg_match('/^(\d{2})-(\d{2})-(\d{4})$/', $date, $m)) {
            return "{$m[3]}-{$m[2]}-{$m[1]}";
        }
        if (preg_match('/^(\d{2})-(\d{2})-(\d{2})$/', $date, $m)) {
            $year = (int)$m[3] + 2000;
            return "{$year}-{$m[2]}-{$m[1]}";
        }
        return substr($date, 0, 10);
    }
}
?>