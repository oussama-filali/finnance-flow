-- Nettoyage: Supprimer la colonne obsolète subcategory_id
-- (Remplacée par subcategory_text en texte libre)

USE finance_flow;

-- Vérifier si la colonne existe avant de la supprimer
ALTER TABLE transactions DROP COLUMN IF EXISTS subcategory_id;

-- Commentaire: subcategory_id n'est plus utilisé, remplacé par subcategory_text
