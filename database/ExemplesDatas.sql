USE ecole_echallens;

-- ============================================================
-- 1. INSERTION DES ENSEIGNANTS (Teachers)
-- ============================================================
INSERT INTO teacher (username, password_hash) VALUES
    ('mme_dupont', 'test'), -- ID 1
    ('test', 'test'),       -- ID 2
    ('m_martin', 'test');   -- ID 3

-- ============================================================
-- 2. INSERTION DES CLASSES
-- ============================================================
INSERT INTO classes (name, is_active) VALUES
    ('1P - Les Explorateurs', 1), -- ID 1
    ('2P - Les Aventuriers', 0);  -- ID 2

-- ============================================================
-- 3. ASSOCIATION PROFS <-> CLASSES
-- ============================================================
-- Attention : Le nom de la table dans ton schéma est 'teacher_has_classes'
INSERT INTO teacher_has_classes (class_id, teacher_id) VALUES
    (1, 1), -- Mme Dupont (ID 1) a la classe 1P (ID 1)
    (1, 2), -- 'test' (ID 2) a AUSSI la classe 1P (Duo pédagogique)
    (2, 3); -- M. Martin (ID 3) a la classe 2P (ID 2)

-- ============================================================
-- 4. PRÉPARATION DES IMAGES (Nécessaire pour les élèves)
-- ============================================================
-- Ton schéma lie l'élève à un ID d'image, on doit donc d'abord créer les images.
INSERT INTO image (name) VALUES
    ('chat bleu fonce'),
    ('chat jaune'),
    ('chien brun'),
    ('chien saumon'),
    ('cochon orange'),
    ('cochon rose'),
    ('elephant bleu clair'),
    ('elephant violet'),
    ('escargot rose fonce'),
    ('escargot vert clair'),
    ('grenouille gris'),
    ('grenouille vert fonce'),
    ('herisson brun'),
    ('herisson saumon'),
    ('lapin orange'),
    ('lapin rose'),
    ('papillon bleu fonce'),
    ('papillon jaune'),
    ('pingouin gris'),
    ('pingouin jaune'),
    ('pingouin vert fonce'),
    ('poisson bleu clair'),
    ('poisson violet'),
    ('souris rose fonce'),
    ('souris vert clair'),
    ('carre_bleu'),
    ('carre_gris'),
    ('carre_jaune'),
    ('carre_rose'),
    ('carre_vert'),
    ('etoile_bleu'),
    ('etoile_gris'),
    ('etoile_jaune'),
    ('etoile_rose'),
    ('etoile_vert'),
    ('losange_bleu'),
    ('losange_gris'),
    ('losange_jaune'),
    ('losange_rose'),
    ('losange_vert'),
    ('pentagone_bleu'),
    ('pentagone_gris'),
    ('pentagone_jaune'),
    ('pentagone_rose'),
    ('pentagone_vert'),
    ('rond_bleu'),
    ('rond_gris'),
    ('rond_jaune'),
    ('rond_rose'),
    ('rond_vert'),
    ('triangle_bleu'),
    ('triangle_gris'),
    ('triangle_jaune'),
    ('triangle_rose'),
    ('triangle_vert');

-- ============================================================
-- 5. INSERTION DES ÉLÈVES (Student)
-- ============================================================
-- On utilise image_id (entier) au lieu du texte directement
INSERT INTO student (name, image_id, class_id) VALUES
    ('Léo', 1, 1),  -- Léo, image 'cochon rose' (ID 1), classe 1
    ('Mia', 2, 1),  -- Mia, image 'herisson saumon' (ID 2), classe 1
    ('Tom', 3, 1);  -- Tom, image 'chien saumon' (ID 3), classe 1

INSERT INTO student (name, image_id, class_id) VALUES
    ('Zoé', 4, 2),   -- Zoé, image 'poisson violet' (ID 4), classe 2
    ('Lucas', 5, 2); -- Lucas, image 'souris rose' (ID 5), classe 2

-- ============================================================
-- 6. PRÉPARATION DES EXERCICES (Pour la progression)
-- ============================================================
-- La table progress a besoin d'un level_id, qui a besoin d'un exercise_id...
-- On crée la structure hiérarchique : Category -> Exercise -> Level

-- A. Catégories
INSERT INTO category (name) VALUES
    ('Classification'), -- ID 1
    ('Combinatoire'), -- ID 2
    ('Conservation'), -- ID 3
    ('Sériation'); -- ID 4
-- B. Exercices
INSERT INTO exercise (name, category_id) VALUES
    ('Pareils ou différents', 1),
    ('Quel est le point commun ?', 1),
    ('La bonne image', 1),
    ('Sur la pile', 1);

-- C. Niveaux (Levels)
INSERT INTO level (exercise_id) VALUES
    (1), -- ID 1 : Niveau 1 de l'exercice Classification
    (1); -- ID 1 : Niveau 2 de l'exercice Classification

-- ============================================================
-- 7. SIMULATION DE PROGRESSION (Progress)
-- ============================================================
-- Maintenant on peut lier l'élève à un ID de niveau existant.

-- Léo (student_id=1) a terminé le niveau 1 de classification (level_id=1)
INSERT INTO progress (student_id, level_id, success_count, is_completed) VALUES
    (1, 1, 10, 1);

-- Mia (student_id=2) a commencé combinatoire (level_id=2)
INSERT INTO progress (student_id, level_id, success_count, is_completed) VALUES
    (2, 2, 3, 0);

-- ============================================================
-- 8. CONFIGURATION CLASSE (Optionnel - Table commentée)
-- ============================================================
-- NOTE : Dans ton schéma CREATE, la table 'class_exercise_data' est en commentaire.
-- Si tu décommentes la création de la table, tu peux décommenter ceci :

/*
INSERT INTO class_exercise_data (class_id, exercise_id, data_json) VALUES
(1, 1, '{"shapes": ["carré_rouge", "rond_bleu"], "time_limit": 60, "instruction": "Trouve les rouges"}');
*/

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT * FROM teacher;
SELECT * FROM classes;
SELECT student.name, image.name as image_nom, classes.name as classe_nom
FROM student
    JOIN image ON student.image_id = image.id
    JOIN classes ON student.class_id = classes.id;
SELECT * FROM progress;