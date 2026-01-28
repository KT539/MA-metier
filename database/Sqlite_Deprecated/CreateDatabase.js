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

    // Active les contraintes de clés étrangères (désactivé par défaut sur SQLite)
    db.run("PRAGMA foreign_keys = ON");

    // 1. Table Teacher
    db.run(`
        CREATE TABLE IF NOT EXISTS teacher (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("Erreur table teacher:", err.message);
        else console.log("Table 'teacher' prête.");
    });

    // 2. Table Classes
    // Modification : teacher_id retiré car relation Many-to-Many créée plus bas
    db.run(`
        CREATE TABLE IF NOT EXISTS classes (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               name TEXT NOT NULL,
                                               is_active BOOLEAN DEFAULT 0
        )
    `, (err) => {
        if (err) console.error("Erreur table classes:", err.message);
        else console.log("Table 'classes' prête.");
    });

    // 3. Des profs ont des classes (Table de liaison)
    // Empêche les doublons avec la PRIMARY KEY composite
    db.run(`
        CREATE TABLE IF NOT EXISTS teacher_has_classes (
                                                           class_id INTEGER NOT NULL,
                                                           teacher_id INTEGER NOT NULL,
                                                           PRIMARY KEY (class_id, teacher_id),
            FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE
            )
    `, (err) => {
        if (err) console.error("Erreur table teacher_has_classes:", err.message);
        else console.log("Table 'teacher_has_classes' prête.");
    });

    // 4. Table Image
    db.run(`
        CREATE TABLE IF NOT EXISTS image (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             path TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error("Erreur table image:", err.message);
        else console.log("Table 'image' prête.");
    });

    // 5. Table Student
    // Modification : Lien vers image et classes mis à jour
    db.run(`
        CREATE TABLE IF NOT EXISTS student (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               name TEXT NOT NULL,
                                               image_id INTEGER,
                                               class_id INTEGER,
                                               FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id) REFERENCES image(id) ON UPDATE CASCADE
            )
    `, (err) => {
        if (err) console.error("Erreur table student:", err.message);
        else console.log("Table 'student' prête.");
    });

    // 6. Table Category
    db.run(`
        CREATE TABLE IF NOT EXISTS category (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )
    `, (err) => {
        if (err) console.error("Erreur table category:", err.message);
        else console.log("Table 'category' prête.");
    });

    // 7. Table Exercise
    // Structure modifiée : plus de type/level ici, mais lien vers category
    db.run(`
        CREATE TABLE IF NOT EXISTS exercise (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                name TEXT,
                                                category_id INTEGER,
                                                FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE CASCADE
            )
    `, (err) => {
        if (err) console.error("Erreur table exercise:", err.message);
        else console.log("Table 'exercise' prête.");
    });

    // 8. Table Level
    // Contient la logique de l'exercice (images, réponse correcte)
    db.run(`
        CREATE TABLE IF NOT EXISTS level (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise_id INTEGER,
            category_id INTEGER,
            image_id_1 INTEGER,
            image_id_2 INTEGER,
            image_id_3 INTEGER,
            image_id_4 INTEGER,
            correct_answer BOOLEAN,
            FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON UPDATE CASCADE,
            FOREIGN KEY (category_id) REFERENCES category(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id_1) REFERENCES image(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id_2) REFERENCES image(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id_3) REFERENCES image(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id_4) REFERENCES image(id) ON UPDATE CASCADE
        )
    `, (err) => {
        if (err) console.error("Erreur table level:", err.message);
        else console.log("Table 'level' prête.");
    });

    // 9. Table Level_has_images
    db.run(`
        CREATE TABLE IF NOT EXISTS level_has_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level_id INTEGER,
            image_id INTEGER,
            FOREIGN KEY (level_id) REFERENCES level(id) ON UPDATE CASCADE,
            FOREIGN KEY (image_id) REFERENCES image(id) ON UPDATE CASCADE
        )
    `, (err) => {
        if (err) console.error("Erreur table level_has_images:", err.message);
        else console.log("Table 'level_has_images' prête.");
    });

    // 10. Table Progress
    // Structure modifiée pour pointer vers level_id
    db.run(`
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            level_id INTEGER,
            success_count INTEGER DEFAULT 0,
            failure_count INTEGER DEFAULT 0,
            is_completed BOOLEAN DEFAULT 0,
            FOREIGN KEY (student_id) REFERENCES student(id) ON UPDATE CASCADE,
            FOREIGN KEY (level_id) REFERENCES level(id) ON UPDATE CASCADE
        )
    `, (err) => {
        if (err) console.error("Erreur table progress:", err.message);
        else console.log("Table 'progress' prête.");
    });

    // 11. Insertion des images dans la table image
    // On vérifie d'abord si la table est vide pour ne pas dupliquer les données à chaque relance
    db.get("SELECT count(*) as count FROM image", (err, row) => {
        if (err) {
            console.error(err.message);
        } else if (row.count === 0) {
            console.log("Insertion des images initiales...");

            const insertImage = db.prepare("INSERT INTO image (name, path) VALUES (?, ?)");

            const images = [
                // Animaux (1–25)
                ['chat bleu fonce', 'public/images/animaux'],
                ['chat jaune', 'public/images/animaux'],
                ['chien brun', 'public/images/animaux'],
                ['chien saumon', 'public/images/animaux'],
                ['cochon orange', 'public/images/animaux'],
                ['cochon rose', 'public/images/animaux'],
                ['elephant bleu clair', 'public/images/animaux'],
                ['elephant violet', 'public/images/animaux'],
                ['escargot rose fonce', 'public/images/animaux'],
                ['escargot vert clair', 'public/images/animaux'],
                ['grenouille gris', 'public/images/animaux'],
                ['grenouille vert fonce', 'public/images/animaux'],
                ['herisson brun', 'public/images/animaux'],
                ['herisson saumon', 'public/images/animaux'],
                ['lapin orange', 'public/images/animaux'],
                ['lapin rose', 'public/images/animaux'],
                ['papillon bleu fonce', 'public/images/animaux'],
                ['papillon jaune', 'public/images/animaux'],
                ['pingouin gris', 'public/images/animaux'],
                ['pingouin jaune', 'public/images/animaux'],
                ['pingouin vert fonce', 'public/images/animaux'],
                ['poisson bleu clair', 'public/images/animaux'],
                ['poisson violet', 'public/images/animaux'],
                ['souris rose fonce', 'public/images/animaux'],
                ['souris vert clair', 'public/images/animaux'],
                // Formes (26–55)
                ['carré bleu', 'public/images/shapes'],
                ['carré gris', 'public/images/shapes'],
                ['carré jaune', 'public/images/shapes'],
                ['carré rose', 'public/images/shapes'],
                ['carré vert', 'public/images/shapes'],
                ['étoile bleu', 'public/images/shapes'],
                ['étoile gris', 'public/images/shapes'],
                ['étoile jaune', 'public/images/shapes'],
                ['étoile rose', 'public/images/shapes'],
                ['étoile vert', 'public/images/shapes'],
                ['losange bleu', 'public/images/shapes'],
                ['losange gris', 'public/images/shapes'],
                ['losange jaune', 'public/images/shapes'],
                ['losange rose', 'public/images/shapes'],
                ['losange vert', 'public/images/shapes'],
                ['pentagone bleu', 'public/images/shapes'],
                ['pentagone gris', 'public/images/shapes'],
                ['pentagone jaune', 'public/images/shapes'],
                ['pentagone rose', 'public/images/shapes'],
                ['pentagone vert', 'public/images/shapes'],
                ['rond bleu', 'public/images/shapes'],
                ['rond gris', 'public/images/shapes'],
                ['rond jaune', 'public/images/shapes'],
                ['rond rose', 'public/images/shapes'],
                ['rond vert', 'public/images/shapes'],
                ['triangle bleu', 'public/images/shapes'],
                ['triangle gris', 'public/images/shapes'],
                ['triangle jaune', 'public/images/shapes'],
                ['triangle rose', 'public/images/shapes'],
                ['triangle vert', 'public/images/shapes']
            ];

            db.run("BEGIN TRANSACTION");
            images.forEach(img => insertImage.run(img[0], img[1]));
            db.run("COMMIT", (err) => {
                if (err) console.error("Erreur insertion images:", err.message);
                else console.log(`${images.length} images insérées.`);
            });
            insertImage.finalize();
        } else {
            console.log("Les images sont déjà présentes dans la base.");
        }
    });

    // Note: Les anciennes sections 'class_exercise_data' et la génération automatique
    // des exercices ont été retirées car elles étaient commentées dans le code SQL fourni
    // et ne correspondent plus à la nouvelle structure des tables.
});

// Fermeture de la base (optionnel si le script doit continuer à tourner)
// db.close();