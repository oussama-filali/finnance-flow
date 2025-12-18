<?php
class KeywordMatcher {
    private $pdo;
    private $keywords = [
        'alimentation' => ['carrefour', 'auchan', 'lidl', 'intermarche', 'casino', 'monoprix', 'leclerc', 'supermarche', 'epicerie'],
        'restaurant' => ['restaurant', 'resto', 'mcdo', 'mcdonald', 'burger', 'pizza', 'kebab', 'sushi', 'cafe', 'brasserie'],
        'transport' => ['sncf', 'train', 'metro', 'ratp', 'uber', 'taxi', 'essence', 'carburant', 'parking', 'station'],
        'loisirs' => ['cinema', 'sport', 'gym', 'fitness', 'concert', 'streaming', 'netflix', 'spotify', 'theatre'],
        'sante' => ['pharmacie', 'medecin', 'hopital', 'mutuelle', 'docteur', 'clinique', 'laboratoire'],
        'logement' => ['loyer', 'edf', 'gaz', 'eau', 'internet', 'electricite', 'sfr', 'orange', 'free', 'bouygues'],
        'shopping' => ['zara', 'hm', 'fnac', 'amazon', 'decathlon', 'ikea', 'leroy', 'castorama'],
        'banque' => ['frais', 'commission', 'cotisation', 'virement', 'retrait']
    ];

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function detect($title, $description = null) {
        $text = strtolower($title . ' ' . $description);
        
        foreach ($this->keywords as $category => $words) {
            foreach ($words as $word) {
                if (strpos($text, $word) !== false) {
                    return $this->getCategoryId($category);
                }
            }
        }
        return null;
    }

    private function getCategoryId($name) {
        $stmt = $this->pdo->prepare("SELECT id FROM categories WHERE LOWER(name) = ? LIMIT 1");
        $stmt->execute([strtolower($name)]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['id'] ?? null;
    }

    public function getKeywords() {
        return $this->keywords;
    }

    public function addKeyword($category, $keyword) {
        if (!isset($this->keywords[$category])) {
            $this->keywords[$category] = [];
        }
        if (!in_array($keyword, $this->keywords[$category])) {
            $this->keywords[$category][] = $keyword;
        }
    }
}