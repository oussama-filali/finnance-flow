-- Seed data pour FinanceFlow

USE financeflow;

-- Utilisateur de test
INSERT INTO users (username, password_hash) VALUES
('testuser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: "password"

-- Catégories principales (NULL = global pour tous)
INSERT INTO categories (name, user_id) VALUES
('alimentation', NULL),
('restaurant', NULL),
('transport', NULL),
('loisirs', NULL),
('sante', NULL),
('logement', NULL),
('shopping', NULL),
('banque', NULL);

-- Sous-catégories pour Logement (id=1)
INSERT INTO subcategories (name, category_id) VALUES
('Loyer', 1),
('Hypothèque', 1),
('Assurance habitation', 1),
('Électricité', 1),
('Eau', 1),
('Gaz', 1),
('Internet', 1),
('Téléphone fixe', 1),
('Entretien et réparations', 1);

-- Sous-catégories pour Services (id=2)
INSERT INTO subcategories (name, category_id) VALUES
('Téléphone mobile', 2),
('Télévision par câble', 2),
('Abonnements streaming', 2),
('Services bancaires', 2);

-- Sous-catégories pour Alimentation et épicerie (id=3)
INSERT INTO subcategories (name, category_id) VALUES
('Courses supermarché', 3),
('Restaurant', 3),
('Fast-food', 3),
('Café et collations', 3),
('Marché/Fruits et légumes', 3);

-- Sous-catégories pour Transport (id=4)
INSERT INTO subcategories (name, category_id) VALUES
('Essence', 4),
('Transport en commun', 4),
('Assurance auto', 4),
('Entretien véhicule', 4),
('Stationnement', 4),
('Péages', 4),
('Location de véhicule', 4);

-- Sous-catégories pour Soins de santé (id=5)
INSERT INTO subcategories (name, category_id) VALUES
('Assurance santé', 5),
('Médicaments', 5),
('Consultations médicales', 5),
('Dentiste', 5),
('Optométriste/Lunettes', 5),
('Soins spécialisés', 5);

-- Sous-catégories pour Service de garde et éducation (id=6)
INSERT INTO subcategories (name, category_id) VALUES
('Garderie/Crèche', 6),
('Frais de scolarité', 6),
('Fournitures scolaires', 6),
('Cours particuliers', 6),
('Activités parascolaires', 6);

-- Sous-catégories pour Soins personnels et mieux-être (id=7)
INSERT INTO subcategories (name, category_id) VALUES
('Coiffeur/Salon', 7),
('Produits de beauté', 7),
('Salle de sport/Gym', 7),
('Vêtements', 7),
('Chaussures', 7),
('Loisirs et divertissements', 7);

-- Sous-catégories pour Remboursement des dettes (id=8)
INSERT INTO subcategories (name, category_id) VALUES
('Prêt étudiant', 8),
('Prêt auto', 8),
('Carte de crédit', 8),
('Prêt personnel', 8),
('Autres dettes', 8);

-- Transactions d'exemple
INSERT INTO transactions (user_id, title, description, amount, date, location, category_id, subcategory_id) VALUES
(1, 'Salaire novembre', 'Paiement mensuel', 2500.00, '2025-11-01', NULL, NULL, NULL),
(1, 'Loyer novembre', 'Paiement loyer appartement', -800.00, '2025-11-01', 'Agence immobilière', 1, 1),
(1, 'Courses hebdomadaires', 'Achat alimentaire', -120.50, '2025-11-02', 'Carrefour', 3, 14),
(1, 'Essence', 'Plein réservoir', -55.00, '2025-11-03', 'Station Total', 4, 20),
(1, 'Électricité', 'Facture octobre', -75.00, '2025-11-01', 'EDF', 1, 4),
(1, 'Restaurant', 'Dîner en famille', -45.00, '2025-11-05', 'Restaurant Le Gourmet', 3, 15),
(1, 'Gym', 'Abonnement mensuel', -35.00, '2025-11-01', 'FitZone', 7, 32),
(1, 'Carte de crédit', 'Remboursement mensuel', -200.00, '2025-11-01', 'Banque', 8, 37);