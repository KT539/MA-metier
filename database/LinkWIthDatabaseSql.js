import mysql from 'mysql2';

// --- CONNEXION À LA BASE DE DONNÉES MYSQL ---

const db = mysql.createConnection({
    host: 'localhost',      // 127.0.0.1
    user: 'root',           // Ton utilisateur HeidiSQL
    password: 'root',           // Ton mot de passe HeidiSQL
    database: 'ecole_echallens' // Le nom de ta base
});

db.connect((err) => {
    if (err) console.error("Erreur connexion MySQL:", err.message);
    else console.log('Connecté à la base de données MySQL.');
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

export const getTeacherByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, username FROM teacher WHERE username = ? AND password_hash = ?`;
        db.query(sql, [username, password], (err, results) => {
            if (err) reject(err);
            // MySQL retourne un tableau, on prend le premier élément
            else resolve(results[0]);
        });
    });
};

// --- FONCTIONS CLASSES (Adaptées pour la liaison N:N) ---

export const getClassesByTeacher = (teacherId) => {
    return new Promise((resolve, reject) => {
        // On récupère les classes liées au prof via la table de liaison
        const sql = `
            SELECT c.id, c.name, c.is_active FROM classes c
            JOIN class_teachers ct ON c.id = ct.class_id
            WHERE ct.teacher_id = ?
        `;
        // db.query(sql, [teacherId], (err, rows) => {
        //    if (err) reject(err);
        //    else resolve(rows);
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

            // 2. On crée la liaison dans la table class_teachers
            const sqlLink = `INSERT INTO class_teachers (class_id, teacher_id) VALUES (?, ?)`;

            db.query(sqlLink, [newClassId, teacherId], (errLink) => {
                if (errLink) return reject(errLink);

                // On renvoie l'objet comme avant
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
        const sql = `SELECT * FROM student WHERE class_id = ?`;
        db.query(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const createStudent = (firstName, animalImage, classId) => {
    return new Promise((resolve, reject) => {
        // Attention aux noms de colonnes (name vs first_name selon ta BDD)
        const sql = `INSERT INTO student (name, animal_image, class_id) VALUES (?, ?, ?)`;
        db.query(sql, [firstName, animalImage, classId], (err, result) => {
            if (err) reject(err);
            else resolve(result.insertId);
        });
    });
};

export const updateStudent = (studentId, firstName, class_id) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE student SET name = ?, class_id = ? WHERE id = ?`;
        db.query(sql, [firstName, class_id, studentId], (err) => {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
};

export const deleteStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        // On supprime d'abord les progrès liés pour éviter les erreurs de clé étrangère
        const sqlDeleteProgress = `DELETE FROM progress WHERE student_id = ?`;

        db.query(sqlDeleteProgress, [studentId], (err) => {
            if (err) {
                // Si erreur, on ne bloque pas forcément, mais c'est mieux de logger
                console.log("Info: Pas de progrès à supprimer ou erreur mineure");
            }

            // Ensuite on supprime l'élève
            const sqlDeleteStudent = `DELETE FROM student WHERE id = ?`;
            db.query(sqlDeleteStudent, [studentId], (err2, result) => {
                if (err2) reject(err2);
                else resolve({ success: true });
            });
        });
    });
};

// --- FONCTIONS PROGRESSION ---

export const getClassProgress = (classId) => {
    return new Promise((resolve, reject) => {
        // Adaptation des noms de colonnes pour MySQL
        const sql = `
            SELECT s.name, p.exercise_type, p.exercise_level, p.is_completed 
            FROM student s
            LEFT JOIN progress p ON s.id = p.student_id
            WHERE s.class_id = ?
        `;
        db.query(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export default db;