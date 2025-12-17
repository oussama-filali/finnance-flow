-- Migration pour ajouter le champ subcategory_text

USE financeflow;

-- Ajouter la colonne subcategory_text si elle n'existe pas
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS subcategory_text VARCHAR(255) NULL AFTER subcategory_id;

-- Afficher confirmation
SELECT 'Migration terminée: subcategory_text ajouté' AS status;
