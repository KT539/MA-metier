DROP DATABASE IF EXISTS ecole_echallens;
CREATE DATABASE ecole_echallens CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ecole_echallens;

-- 1. Table Teacher
CREATE TABLE teacher (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. Table Classes
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 0
);

-- 3. NOUVELLE TABLE DE LIAISON (Plusieurs profs <-> Plusieurs classes)
CREATE TABLE class_teachers (
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    PRIMARY KEY (class_id, teacher_id), -- Empêche les doublons
    CONSTRAINT fk_ct_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_ct_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
);

-- 4. Table Student
CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    animal_image VARCHAR(255),
    class_id INT,
    CONSTRAINT fk_student_classes FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE
);

-- 5. Table Exercise
CREATE TABLE exercise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    level INT,
    INDEX idx_type (type),
    INDEX idx_level (level)
);

-- 6. Table Progress
CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_type VARCHAR(50),
    exercise_level INT,
    success_count INT DEFAULT 0,
    is_completed TINYINT(1) DEFAULT 0,
    student_id INT,
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES student(id) ON UPDATE CASCADE,
    CONSTRAINT fk_progress_type FOREIGN KEY (exercise_type) REFERENCES exercise(type) ON UPDATE CASCADE,
    CONSTRAINT fk_progress_level FOREIGN KEY (exercise_level) REFERENCES exercise(level) ON UPDATE CASCADE
);

-- 7. Table Class_Exercise_Data
CREATE TABLE class_exercise_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    exercise_id INT NOT NULL,
    data_json TEXT,
    CONSTRAINT fk_ced_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_ced_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
    UNIQUE KEY uk_class_exercise (class_id, exercise_id)
);

-- Génération des exercices (Procédure stockée)
DELIMITER //
CREATE PROCEDURE GenerateExercises()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 30 DO
        INSERT INTO exercise (type, level) VALUES ('classification', i), ('combinatoire', i), ('sériation', i), ('conservation', i);
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;
CALL GenerateExercises();
DROP PROCEDURE GenerateExercises;