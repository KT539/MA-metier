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
            exercise_type TEXT,
            exercise_level INT,
            success_count INT DEFAULT 0,
            is_completed BOOLEAN DEFAULT 0,
            student_id INT,
            FOREIGN KEY (student_id) REFERENCES student(id) ON UPDATE CASCADE,
            FOREIGN KEY (exercise_type) REFERENCES exercise(type) ON UPDATE CASCADE,
            FOREIGN KEY (exercise_level) REFERENCES exercise(level) ON UPDATE CASCADE
        )`, (err) => {
        if (err) {
            console.error("Erreur création table progress:", err.message);
        } else {
            console.log("Table 'progress' prête.");
        }
    });

    // Création de la table exercise
    db.run(`
        CREATE TABLE IF NOT EXISTS exercise (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               type TEXT,
               level INT
        )`, (err) => {
        if (err) {
            console.error("Erreur création table exercise:", err.message);
        } else {
            console.log("Table 'exercise' prête.");
        }
    });

    // Cette table permet à chaque classe d'avoir sa propre version d'un exercice
    // 'data_json' contiendra les paramètres générés (ex: { "formes": ["carré_vert", "triangle_gris"], "answer": "carré_vert" })
    // data_json va être modifié pour les formes
    db.run(`
        CREATE TABLE IF NOT EXISTS class_exercise_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            exercise_id INTEGER NOT NULL,
            data_json TEXT,
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
            UNIQUE(class_id, exercise_id)
            )
    `, (err) => {
        if (!err) console.log("Table 'class_exercise_data' prête.");
    });

    //insertion type exercise
    const types = ['classification', 'combinatoire', 'sériation', 'conservation'];
    const maxLevels = 30;

    const stmt = db.prepare("INSERT INTO exercise (type, level) VALUES (?, ?)");

    // On utilise une transaction pour que ça soit rapide (une seule écriture disque au lieu de 120)
    db.run("BEGIN TRANSACTION");

    types.forEach(type => {
        for (let level = 1; level <= maxLevels; level++) {
            stmt.run(type, level);
        }
    });
    db.run("COMMIT", (err) => {
        if (err) console.error("Erreur lors de la génération des exercices:", err.message);
        else console.log(`Vérification terminée : 4 types x ${maxLevels} niveaux sont assurés dans la base.`);
    });

    stmt.finalize();
});

// Fermeture de la base
// db.close();