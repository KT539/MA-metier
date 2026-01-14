import sqlite3 from 'sqlite3';

// On active le mode verbose
const verboseSqlite = sqlite3.verbose();

// Crée la base de données si pas existante
const db = new verboseSqlite.Database('./ecole_echallens.db', (err) => {
    if (err) {
        console.error('Erreur de connexion:', err.message);
    } else {
        console.log('Base de données SQLite connectée.');
    }
});

// Utilisation de serialize pour s'assurer que les requêtes s'exécutent l'une après l'autre
db.serialize(() => {

    // Création de la table teacher
    db.run(`
        CREATE TABLE IF NOT EXISTS teacher (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Erreur création table teacher:", err.message);
        } else {
            console.log("Table 'teacher' prête.");
        }
    });

    // Création de la table Classes
    // is_active détermine si l'interface élève est accessible
    db.run(`
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            teacher_id INTEGER,
            is_active BOOLEAN DEFAULT 0,
            FOREIGN KEY (teacher_id) REFERENCES teacher(id)
        )
        `,(err) => {
        if (err) {
            console.error("Erreur création table classes:", err.message);
        } else {
            console.log("Table 'classes' prête.");
        }
    });

    // Création de la table student
    db.run(`
        CREATE TABLE IF NOT EXISTS student (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               animal_image IMAGE,
               class_id INTEGER,
               FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE
        )`, (err) => {
        if (err) {
            console.error("Erreur création table student:", err.message);
        } else {
            console.log("Table 'student' prête.");
        }
    });

    // Création de la table progression
    db.run(`
        CREATE TABLE IF NOT EXISTS progress (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               module_name TEXT,
               level_number INT,
               success_count INT DEFAULT 0,
               is_completed BOOLEAN DEFAULT 0,
               student_id INT,
               FOREIGN KEY (student_id) REFERENCES student(id) ON UPDATE CASCADE
        )`, (err) => {
        if (err) {
            console.error("Erreur création table progress:", err.message);
        } else {
            console.log("Table 'progress' prête.");
        }
    });
});

// Fermeture de la base
// db.close();