USE ecole_echallens;

-- ============================================================
-- 1. INSERTION DES ENSEIGNANTS (Teachers)
-- ============================================================
-- Note : Dans une vraie app, le password_hash est généré par Node.js (bcrypt).
-- Ici, on met en clair pour le moment
INSERT INTO teacher (username, password_hash) VALUES 
('mme_dupont', 'test'),
('test', 'test'),
('m_martin', 'test');

-- ============================================================
-- 2. INSERTION DES CLASSES
-- ============================================================
-- On suppose que Mme Dupont a l'ID 1 et M. Martin l'ID 2
INSERT INTO classes (name, is_active) VALUES 
('1P - Les Explorateurs', 1), -- Classe active
('2P - Les Aventuriers', 0);  -- Classe inactive

-- ============================================================
-- 3. ASSOCIATION PROFS <-> CLASSES (C'est ici que ça change !)
-- ============================================================
INSERT INTO class_teachers (class_id, teacher_id) VALUES 
(1, 1), -- Mme Dupont a la classe 1P
(1, 3), -- test a AUSSI la classe 1P (Duo pédagogique)
(2, 2); -- M. Martin a la classe 2P (tout seul)

-- ============================================================
-- 4. INSERTION DES ÉLÈVES (Students)
-- ============================================================
-- On ajoute des élèves à la classe 1 (Les Explorateurs)
INSERT INTO student (name, animal_image, class_id) VALUES 
('Léo', 'cochon rose.png', 1),
('Mia', 'herisson_saumon.png', 1),
('Tom', 'chien_saumon.png', 1);

-- On ajoute des élèves à la classe 2 (Les Aventuriers)
INSERT INTO student (name, animal_image, class_id) VALUES 
('Zoé', 'poisson_violet.png', 2),
('Lucas', 'souris_rose_fonce.png', 2);

-- ============================================================
-- 5. CONFIGURATION D'UN EXERCICE POUR UNE CLASSE (Class_Exercise_Data)
-- ============================================================
-- Supposons que l'exercice ID 1 est "classification - niveau 1"
-- La classe 1 (Mme Dupont) veut des formes spécifiques pour cet exercice.
-- On insère du JSON dans la colonne data_json.
INSERT INTO class_exercise_data (class_id, exercise_id, data_json) VALUES 
(1, 1, '{"shapes": ["carré_rouge", "rond_bleu"], "time_limit": 60, "instruction": "Trouve les rouges"}');

-- ============================================================
-- 6. SIMULATION DE PROGRESSION (Progress)
-- ============================================================
-- Léo (student_id=1) a terminé le niveau 1 de classification
INSERT INTO progress (student_id, exercise_type, exercise_level, success_count, is_completed) VALUES 
(1, 'classification', 1, 10, 1);

-- Mia (student_id=2) a commencé le niveau 1 de combinatoire mais ne l'a pas fini
INSERT INTO progress (student_id, exercise_type, exercise_level, success_count, is_completed) VALUES 
(2, 'combinatoire', 1, 3, 0);

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT * FROM teacher;
SELECT * FROM classes;
SELECT * FROM student;
SELECT * FROM progress;