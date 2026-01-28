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

-- 3. Des profs ont des classes
CREATE TABLE teacher_has_classes (
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    PRIMARY KEY (class_id, teacher_id), -- Empêche les doublons
    CONSTRAINT fk_ct_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_ct_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
);

-- 4. Table Image
create table image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    path VARCHAR(50) NOT NULL
    );

-- 5. Table Student
CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_id INT,
    class_id INT,
    CONSTRAINT fk_student_classes FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE,
    CONSTRAINT fk_student_image FOREIGN KEY (image_id) REFERENCES image(id) ON UPDATE CASCADE
);

-- 6. Table Category
CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

-- 7. Table Exercise
create table exercise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    category_id INT,
    CONSTRAINT fk_exercise_category FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE CASCADE
);

-- 8. Table Level
CREATE TABLE level (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT,
    category_id INT,
    image_id_1 INT,
    image_id_2 INT,
    image_id_3 INT,
    image_id_4 INT,
    correct_answer BOOLEAN,
    CONSTRAINT fk_level_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_category FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_image1 FOREIGN KEY (image_id_1) REFERENCES image(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_image2 FOREIGN KEY (image_id_2) REFERENCES image(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_image3 FOREIGN KEY (image_id_3) REFERENCES image(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_image4 FOREIGN KEY (image_id_4) REFERENCES image(id) ON UPDATE CASCADE
);

-- 9. Table Level_has_images
create table level_has_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT,
    image_id INT,
    CONSTRAINT fk_level_has_images_level FOREIGN KEY (level_id) REFERENCES level(id) ON UPDATE CASCADE,
    CONSTRAINT fk_level_has_images_image FOREIGN KEY (image_id) REFERENCES image(id) ON UPDATE CASCADE
);

-- 10. Table Progress
CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    level_id INT,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    is_completed TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES student(id) ON UPDATE CASCADE,
    CONSTRAINT fk_progress_level FOREIGN KEY (level_id) REFERENCES level(id) ON UPDATE CASCADE
);

-- 11. Table Class_Exercise_Data
-- CREATE TABLE class_exercise_data (
--    id INT AUTO_INCREMENT PRIMARY KEY,
--    class_id INT NOT NULL,
--    exercise_id INT NOT NULL,
--    data_json TEXT,
--    CONSTRAINT fk_ced_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
--    CONSTRAINT fk_ced_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
--    UNIQUE KEY uk_class_exercise (class_id, exercise_id)
-- );

-- Génération des exercices (Procédure stockée)
-- DELIMITER //
-- CREATE PROCEDURE GenerateExercises()
-- BEGIN
--    DECLARE i INT DEFAULT 1;
--    WHILE i <= 30 DO
--        INSERT INTO exercise (type, level) VALUES ('classification', i), ('combinatoire', i), ('sériation', i), ('conservation', i);
--        SET i = i + 1;
--    END WHILE;
-- END //
-- DELIMITER ;
-- CALL GenerateExercises();
-- DROP PROCEDURE GenerateExercises;