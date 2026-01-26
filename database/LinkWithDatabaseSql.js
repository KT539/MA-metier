import mysql from 'mysql2';
import dotenv from 'dotenv';
// Charge .env
dotenv.config();
// --- CONNEXION À LA BASE DE DONNÉES MYSQL ---

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) console.error("Erreur connexion MySQL:", err.message);
    else console.log(`Connecté à la base de données MySQL (${process.env.DB_NAME}).`);
});

// --- FONCTIONS AUTHENTIFICATION ---

export const createTeacher = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO teacher (username, password_hash) VALUES (?, ?)`;
        db.query(sql, [username, password], (err, result) => {
            if (err) reject(err);
            // En MySQL, l'ID généré est dans result.insertId
            else resolve(result.insertId);
        });
    });
};

export const getTeacherByUsername = (username) => {
    return new Promise((resolve, reject) => {
        // On récupère le hash stocké pour pouvoir le comparer ensuite
        const sql = `SELECT id, username, password_hash FROM teacher WHERE username = ?`;
        db.query(sql, [username], (err, results) => {
            if (err) reject(err);
            else resolve(results[0]); // Retourne undefined si pas trouvé
        });
    });
};

// export const getTeacherByCredentials = (username, password) => {
//    return new Promise((resolve, reject) => {
//        const sql = `SELECT id, username FROM teacher WHERE username = ? AND password_hash = ?`;
//        db.query(sql, [username, password], (err, results) => {
//            if (err) reject(err);
//            // MySQL retourne un tableau, on prend le premier élément
//            else resolve(results[0]);
//        });
//    });
// };

// --- FONCTIONS CLASSES (Adaptées pour la liaison N:N) ---

export const getClassesByTeacher = (teacherId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.id, c.name, c.is_active FROM classes c
                                                      JOIN teacher_has_classes thc ON c.id = thc.class_id
            WHERE thc.teacher_id = ?
        `;
        db.query(sql, [teacherId], (err, rows) => {
            if (err) {
                console.error("Erreur SQL getClassesByTeacher:", err);
                reject(err);
            } else resolve(rows);
        });
    });
};

export const createClass = (name, teacherId) => {
    return new Promise((resolve, reject) => {
        // 1. On insère la classe (juste le nom)
        // Note: is_active est à 0 par défaut dans la BDD
        const sqlInsertClass = `INSERT INTO classes (name, is_active) VALUES (?, 0)`;

        db.query(sqlInsertClass, [name], (err, result) => {
            if (err) return reject(err);

            const newClassId = result.insertId;

            // 2. On crée la liaison dans la table teacher_has_classes
            const sqlLink = `INSERT INTO teacher_has_classes (class_id, teacher_id) VALUES (?, ?)`;

            db.query(sqlLink, [newClassId, teacherId], (errLink) => {
                if (errLink) return reject(errLink);

                resolve({ id: newClassId, name });
            });
        });
    });
};

export const toggleClassStatus = (classId, isActive) => {
    return new Promise((resolve, reject) => {
        // Conversion booléen -> 1 ou 0 pour MySQL
        const val = isActive ? 1 : 0;
        const sql = `UPDATE classes SET is_active = ? WHERE id = ?`;
        db.query(sql, [val, classId], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
};

// --- FONCTIONS ÉLÈVES ---

export const getStudentsByClass = (classId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.id, s.name, i.name as animal_image, s.class_id
            FROM student s
                     LEFT JOIN image i ON s.image_id = i.id
            WHERE s.class_id = ?
        `;
        db.query(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const createStudent = (firstName, animalImageName, classId) => {
    return new Promise((resolve, reject) => {
        // Étape 1 : On doit trouver l'ID de l'image correspondant au nom (ex: "cochon rose")
        const sqlFindImage = `SELECT id FROM image WHERE name = ?`;

        db.query(sqlFindImage, [animalImageName], (err, results) => {
            if (err) return reject(err);

            if (results.length === 0) {
                return reject(new Error(`L'image "${animalImageName}" n'existe pas dans la base de données.`));
            }

            const imageId = results[0].id;

            // Étape 2 : Insertion de l'élève avec l'ID de l'image trouvé
            const sqlInsert = `INSERT INTO student (name, image_id, class_id) VALUES (?, ?, ?)`;
            db.query(sqlInsert, [firstName, imageId, classId], (errInsert, result) => {
                if (errInsert) reject(errInsert);
                else resolve(result.insertId);
            });
        });
    });
};

export const updateStudent = (studentId, firstName, class_id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE student SET name = ?, class_id = ? WHERE id = ?`;
        db.query(sql, [firstName, class_id, studentId], (err) => {
            if (err) return reject(err); // On retourne le rejet pour stopper
            resolve({ success: true });
        });
    });
};

export const deleteStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        // On supprime d'abord les progrès liés pour éviter les erreurs de clé étrangère
        const sqlDeleteProgress = `DELETE FROM progress WHERE student_id = ?`;

        db.query(sqlDeleteProgress, [studentId], (err, result) => {
            if (err) {
                console.error("Erreur suppression progression:", err);
                return reject(err);
            }

            // Ensuite on supprime l'élève
            const sqlDeleteStudent = `DELETE FROM student WHERE id = ?`;
            db.query(sqlDeleteStudent, [studentId], (err2, result2) => {
                if (err2) return reject(err2);
                resolve({ success: true });
            });
        });
    });
};

// --- FONCTIONS PROGRESSION ---

export const getClassProgress = (classId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                s.name, 
                e.name as exercise_type,    -- Nom de l'exercice (ex: Classification)
                l.id as exercise_level,     -- ID ou numéro du niveau
                p.is_completed 
            FROM student s
                LEFT JOIN progress p ON s.id = p.student_id
                LEFT JOIN level l ON p.level_id = l.id
                LEFT JOIN exercise e ON l.exercise_id = e.id
            WHERE s.class_id = ?
        `;
        db.query(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// get shape image for classification1_form (ID 26 à 55)
export const getShapesImages = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, name FROM image WHERE id BETWEEN 26 AND 55`;
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// create new level
export const createLevel = (exerciseId, categoryId, imageId1, imageId2, correctAnswer) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO level (exercise_id, category_id, image_id_1, image_id_2, correct_answer) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [exerciseId, categoryId, imageId1, imageId2, correctAnswer], (err, result) => {
            if (err) reject(err);
            else resolve(result.insertId);
        });
    });
};

// Récupérer les niveaux pour un type d'exercice donné (par nom)
export const getLevelsByExerciseName = (exerciseName) => {
    return new Promise((resolve, reject) => {
        // On joint les tables level et exercise pour filtrer par nom d'exercice
        const sql = `
            SELECT l.id, l.exercise_id 
            FROM level l
            JOIN exercise e ON l.exercise_id = e.id
            WHERE e.name = ?
            ORDER BY l.id ASC
        `;
        db.query(sql, [exerciseName], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// --- FONCTIONS SUPPLÉMENTAIRES (Classification 2 & Général) ---

// Récupérer toutes les catégories (pour le formulaire de création)
export const getCategories = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM category`;
        db.query(sql, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Récupérer un niveau par son ID avec les détails (images dynamiques, catégorie et réponse)
export const getLevelById = (levelId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                l.id,
                l.correct_answer,
                i1.name as image1_name, -- On a besoin du NOM (ex: "carre bleu")
                i2.name as image2_name
            FROM level l
                     LEFT JOIN image i1 ON l.image_id_1 = i1.id
                     LEFT JOIN image i2 ON l.image_id_2 = i2.id
            WHERE l.id = ?
        `;
        db.query(sql, [levelId], (err, result) => {
            if (err) reject(err);
            else resolve(result[0]);
        });
    });
};

// Sauvegarder la progression de l'élève
export const saveProgress = (studentId, levelId, isSuccess) => {
    return new Promise((resolve, reject) => {
        // On vérifie d'abord si une progression existe déjà
        const checkSql = `SELECT * FROM progress WHERE student_id = ? AND level_id = ?`;

        db.query(checkSql, [studentId, levelId], (err, results) => {
            if (err) return reject(err);

            if (results.length > 0) {
                // On incrémente le succès si c'est réussi
                if (isSuccess) {
                    const updateSql = `UPDATE progress SET success_count = success_count + 1, is_completed = 1 WHERE id = ?`;
                    db.query(updateSql, [results[0].id], (e, r) => {
                        if (e) reject(e); else resolve(r);
                    });
                } else {
                    resolve({ message: "Échec enregistré (pas de changement)" });
                }
            } else {
                // Création
                const insertSql = `INSERT INTO progress (student_id, level_id, success_count, is_completed) VALUES (?, ?, ?, ?)`;
                // Si réussi du premier coup, success=1, completed=1. Sinon 0.
                const successVal = isSuccess ? 1 : 0;
                db.query(insertSql, [studentId, levelId, successVal, successVal], (e, r) => {
                    if (e) reject(e); else resolve(r);
                });
            }
        });
    });
};

// Récupérer l'ID d'un exercice par son nom (Utile pour la création)
export const getExerciseIdByName = (name) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id FROM exercise WHERE name = ?`;
        db.query(sql, [name], (err, res) => {
            if (err) reject(err);
            else resolve(res[0] ? res[0].id : null);
        });
    });
};

export async function recordFailure(studentId, levelId) {
    return new Promise((resolve, reject) => {
        // 1. On vérifie si une entrée existe déjà
        const checkSql = "SELECT id FROM progress WHERE student_id = ? AND level_id = ?";
        db.query(checkSql, [studentId, levelId], (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                // 2A. Ça existe -> On incrémente failure_count
                const updateSql = "UPDATE progress SET failure_count = failure_count + 1 WHERE id = ?";
                db.query(updateSql, [rows[0].id], (err2) => {
                    if (err2) reject(err2);
                    else resolve({ status: "updated", id: rows[0].id });
                });
            } else {
                // 2B. Ça n'existe pas -> On crée la ligne avec failure_count = 1
                const insertSql = "INSERT INTO progress (student_id, level_id, failure_count, success_count, is_completed) VALUES (?, ?, 1, 0, 0)";
                db.query(insertSql, [studentId, levelId], (err3, result) => {
                    if (err3) reject(err3);
                    else resolve({ status: "created", id: result.insertId });
                });
            }
        });
    });
}

export default db;
