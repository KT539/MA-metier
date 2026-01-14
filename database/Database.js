import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à la base de données
const dbPath = path.resolve(__dirname, 'ecole_echallens.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Erreur connexion BD:", err.message);
    else console.log('Connecté à la base de données SQLite.');
});

// --- FONCTIONS AUTHENTIFICATION ---

export const createTeacher = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO teacher (username, password_hash) VALUES (?, ?)`;
        db.run(sql, [username, password], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

export const getTeacherByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, username FROM teacher WHERE username = ? AND password_hash = ?`;
        db.get(sql, [username, password], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// --- FONCTIONS CLASSES ---

export const getClassesByTeacher = (teacherId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM classes WHERE teacher_id = ?`;
        db.all(sql, [teacherId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const createClass = (name, teacherId) => {
    return new Promise((resolve, reject) => {
        // 1. On vérifie l'existence ou non de la classe
        const checkSql = `SELECT id FROM classes WHERE name = ? AND teacher_id = ?`;

        db.get(checkSql, [name, teacherId], (err, row) => {
            if (err) return reject(err);

            if (row) {
                // Si une ligne est trouvée -> on rejette
                return reject(new Error("Cette classe existe déjà."));
            }

            // Sinon on la crée
            const insertSql = `INSERT INTO classes (name, teacher_id) VALUES (?, ?)`;
            db.run(insertSql, [name, teacherId], function(err) {
                if (err) return reject(err);
                resolve({ id: this.lastID, name });
            });
        });
    });
};

export const toggleClassStatus = (classId, isActive) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE classes SET is_active = ? WHERE id = ?`;
        db.run(sql, [isActive ? 1 : 0, classId], function(err) {
            if (err) reject(err);
            else resolve({ success: true });
        });
    });
};

// --- FONCTIONS ÉLÈVES ---

export const getStudentsByClass = (classId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM student WHERE class_id = ?`;
        db.all(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const createStudent = (firstName, animalImage, classId) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO student (name, animal_image, class_id) VALUES (?, ?, ?)`;
        db.run(sql, [firstName, animalImage, classId], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

// --- FONCTIONS PROGRESSION ---

export const getClassProgress = (classId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.first_name, p.module_name, p.level_number, p.is_completed 
            FROM student s
            LEFT JOIN progress p ON s.id = p.student_id
            WHERE s.class_id = ?
        `;
        db.all(sql, [classId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Exporte l'objet db par défaut si besoin d'accès direct ailleurs,
// mais on privilégie les fonctions exportées ci-dessus.
export default db;