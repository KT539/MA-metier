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
INSERT INTO teacher_has_classes (class_id, teacher_id) VALUES
    (1, 1), -- Mme Dupont (ID 1) a la classe 1P (ID 1)
    (1, 2), -- 'test' (ID 2) a AUSSI la classe 1P (Duo pédagogique)
    (2, 3); -- M. Martin (ID 3) a la classe 2P (ID 2)

-- En commentaire car inséré dans lors de la création de la db
-- ============================================================
-- 4. PRÉPARATION DES IMAGES (Nécessaire pour les élèves)
-- ============================================================
-- INSERT INTO image (name, path) VALUES
-- Animaux (1–25)
-- ('chat bleu fonce', 'public/images/animaux'),
-- ('chat jaune', 'public/images/animaux'),
-- ('chien brun', 'public/images/animaux'),
-- ('chien saumon', 'public/images/animaux'),
-- ('cochon orange', 'public/images/animaux'),
-- ('cochon rose', 'public/images/animaux'),
-- ('elephant bleu clair', 'public/images/animaux'),
-- ('elephant violet', 'public/images/animaux'),
-- ('escargot rose fonce', 'public/images/animaux'),
-- ('escargot vert clair', 'public/images/animaux'),
-- ('grenouille gris', 'public/images/animaux'),
-- ('grenouille vert fonce', 'public/images/animaux'),
-- ('herisson brun', 'public/images/animaux'),
-- ('herisson saumon', 'public/images/animaux'),
-- ('lapin orange', 'public/images/animaux'),
-- ('lapin rose', 'public/images/animaux'),
-- ('papillon bleu fonce', 'public/images/animaux'),
-- ('papillon jaune', 'public/images/animaux'),
-- ('pingouin gris', 'public/images/animaux'),
-- ('pingouin jaune', 'public/images/animaux'),
-- ('pingouin vert fonce', 'public/images/animaux'),
-- ('poisson bleu clair', 'public/images/animaux'),
-- ('poisson violet', 'public/images/animaux'),
-- ('souris rose fonce', 'public/images/animaux'),
-- ('souris vert clair', 'public/images/animaux'),

-- Formes (26–55)
-- ('carré bleu', 'public/images/shapes'),
-- ('carré gris', 'public/images/shapes'),
-- ('carré jaune', 'public/images/shapes'),
-- ('carré rose', 'public/images/shapes'),
-- ('carré vert', 'public/images/shapes'),
-- ('étoile bleu', 'public/images/shapes'),
-- ('étoile gris', 'public/images/shapes'),
-- ('étoile jaune', 'public/images/shapes'),
-- ('étoile rose', 'public/images/shapes'),
-- ('étoile vert', 'public/images/shapes'),
-- ('losange bleu', 'public/images/shapes'),
-- ('losange gris', 'public/images/shapes'),
-- ('losange jaune', 'public/images/shapes'),
-- ('losange rose', 'public/images/shapes'),
-- ('losange vert', 'public/images/shapes'),
-- ('pentagone bleu', 'public/images/shapes'),
-- ('pentagone gris', 'public/images/shapes'),
-- ('pentagone jaune', 'public/images/shapes'),
-- ('pentagone rose', 'public/images/shapes'),
-- ('pentagone vert', 'public/images/shapes'),
-- ('rond bleu', 'public/images/shapes'),
-- ('rond gris', 'public/images/shapes'),
-- ('rond jaune', 'public/images/shapes'),
-- ('rond rose', 'public/images/shapes'),
-- ('rond vert', 'public/images/shapes'),
-- ('triangle bleu', 'public/images/shapes'),
-- ('triangle gris', 'public/images/shapes'),
-- ('triangle jaune', 'public/images/shapes'),
-- ('triangle rose', 'public/images/shapes'),
-- ('triangle vert', 'public/images/shapes');

-- ============================================================
-- 5. INSERTION DES ÉLÈVES (Student)
-- ============================================================
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
-- La table progress a besoin d'un level_id, qui a besoin d'un exercise_id
-- On crée la structure hiérarchique : Category -> Exercise -> Level

-- A. Catégories
-- INSERT INTO category (name) VALUES
--    ('Classification'), -- ID 1
--    ('Combinatoire'), -- ID 2
--    ('Conservation'), -- ID 3
--    ('Sériation'); -- ID 4
-- B. Exercices
-- INSERT INTO exercise (name, category_id) VALUES
--    ('Pareils ou différents ?', 1),
--    ('Quel est le point commun ?', 1),
--    ('La bonne image', 1),
--    ('Sur la pile', 1);

-- C. Niveaux (Levels)
INSERT INTO level (exercise_id, category_id, image_id_1, image_id_2, correct_answer) VALUES
    (1, 1, 27, 41, 0), -- ID 1 : Niveau 1 de l'exercice Classification
    (1, 1, 35, 35, 1); -- ID 1 : Niveau 2 de l'exercice Classification

-- ============================================================
-- 7. SIMULATION DE PROGRESSION (Progress)
-- ============================================================

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