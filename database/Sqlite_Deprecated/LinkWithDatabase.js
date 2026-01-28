import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

// Configuration pour __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Définition du chemin pour les images
const dossierStatic = path.join(__dirname, 'public');
app.use(express.static(dossierStatic));

// --- CONNEXION À LA BASE DE DONNÉES SQLITE ---

// On active le mode verbose pour le debug
const verboseSqlite = sqlite3.verbose();

const db = new verboseSqlite.Database('./ecole_echallens.db', (err) => {
    if (err) {
        console.error('Erreur de connexion:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        // On active les clés étrangères par sécurité
        db.run("PRAGMA foreign_keys = ON");
    }
});

// --- FONCTIONS AUTHENTIFICATION ---

const createTeacher = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO teacher (username, password_hash) VALUES (?, ?)`;
        // En SQLite, il faut utiliser function(err) classique pour accéder à 'this.lastID'
        db.run(sql, [username, password], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

const getTeacherByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, username, password_hash FROM teacher WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else resolve(row); // Retourne undefined si pas trouvé
        });
    });
};

// --- FONCTIONS CLASSES ---

const getClassesByTeacher = (teacherId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT c.id, c.name, c.is_active 
            FROM classes c
            JOIN teacher_has_classes thc ON c.id = thc.class_id
            WHERE thc.teacher_id = ?
        `;
        db.all(sql, [teacherId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const createClass = (name, teacherId) => {
    return new Promise((resolve, reject) => {
        // 1. On insère la classe
        const sqlInsertClass = `INSERT INTO classes (name, is_active) VALUES (?, 0)`;

        db.run(sqlInsertClass, [name], function(err) {
            if (err) return reject(err);

            const newClassId = this.lastID;

            // 2. On crée la liaison
            const sqlLink = `INSERT INTO teacher_has_classes (class_id, teacher_id) VALUES (?, ?)`;

            db.run(sqlLink, [newClassId, teacherId], function(errLink) {
                if (errLink) return reject(errLink);
                resolve({ id: newClassId, name });
            });
        });
    });
};

// --- FONCTIONS ÉLÈVES ---

const createStudent = (firstName, animalImageName, classId) => {
    return new Promise((resolve, reject) => {
        // Étape 1 : Trouver l'ID de l'image
        const sqlFindImage = `SELECT id, name, path FROM image WHERE name = ?`;

        db.get(sqlFindImage, [animalImageName], (err, row) => {
            if (err) return reject(err);
            if (!row) return reject(new Error(`L'image "${animalImageName}" n'existe pas.`));

            const imageId = row.id;
            const fullPath = row.path;

            // Étape 2 : Insertion de l'élève
            const sqlInsert = `INSERT INTO student (name, image_id, class_id) VALUES (?, ?, ?)`;
            db.run(sqlInsert, [firstName, imageId, classId], function(errInsert) {
                if (errInsert) reject(errInsert);
                else resolve({ insertId: this.lastID, imagePath: fullPath });
            });
        });
    });
};

// --- FONCTIONS PROGRESSION ---

const saveProgress = (studentId, levelId, isSuccess) => {
    return new Promise((resolve, reject) => {
        // Vérification existence
        const checkSql = `SELECT id, success_count FROM progress WHERE student_id = ? AND level_id = ?`;

        db.get(checkSql, [studentId, levelId], (err, row) => {
            if (err) return reject(err);

            if (row) {
                // Mise à jour
                if (isSuccess) {
                    const updateSql = `UPDATE progress SET success_count = success_count + 1, is_completed = 1 WHERE id = ?`;
                    db.run(updateSql, [row.id], function(e) {
                        if (e) reject(e);
                        else resolve({ completed: true, count: row.success_count + 1 });
                    });
                } else {
                    const failSql = `UPDATE progress SET failure_count = failure_count + 1 WHERE id = ?`;
                    db.run(failSql, [row.id], function(e) {
                        if (e) reject(e); else resolve({ message: "Échec enregistré" });
                    });
                }
            } else {
                // Création
                const insertSql = `INSERT INTO progress (student_id, level_id, success_count, failure_count, is_completed) VALUES (?, ?, ?, ?, ?)`;
                const successVal = isSuccess ? 1 : 0;
                // is_completed est true (1) si successVal est 1
                db.run(insertSql, [studentId, levelId, successVal, 0, successVal], function(e) {
                    if (e) reject(e);
                    else resolve({ completed: !!successVal, count: successVal });
                });
            }
        });
    });
};

// --- ROUTES EXPRESS ---

// --- ROUTE : INSCRIPTION PROF ---
app.post('/api/add-teacher', (req, res) => {
    const { username, password } = req.body;
    createTeacher(username, password)
        .then((id) => res.json({ success: true, message: "Compte créé", id }))
        .catch((err) => res.status(500).json({ error: err.message }));
});

// --- ROUTE : LOGIN PROF ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    getTeacherByUsername(username)
        .then((teacher) => {
            if (!teacher) return res.status(401).json({ error: "Utilisateur inconnu" });
            if (teacher.password_hash !== password) return res.status(401).json({ error: "Mot de passe incorrect" });

            res.json({ success: true, teacherId: teacher.id, username: teacher.username });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// --- ROUTE : RÉCUPÉRER CLASSES ---
app.get('/api/classes/:teacherId', (req, res) => {
    getClassesByTeacher(req.params.teacherId)
        .then(rows => res.json(rows))
        .catch(err => res.status(500).json({ error: err.message }));
});

// --- ROUTE : CRÉER UNE CLASSE ---
app.post('/api/add-class', (req, res) => {
    const { name, teacherId } = req.body;
    createClass(name, teacherId)
        .then(result => res.json({ success: true, ...result }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// --- ROUTE : AJOUTER UN ÉLÈVE ---
app.post('/api/add-student', (req, res) => {
    // Note : On utilise classId maintenant
    const { classId, firstName } = req.body;

    // 1. Récupérer toutes les images d'animaux depuis la DB
    const sqlGetAnimaux = `SELECT name FROM image WHERE path LIKE '%animaux%'`;

    db.all(sqlGetAnimaux, [], (err, rowsImages) => {
        if (err) return res.status(500).json({ error: err.message });

        const touteslesImages = rowsImages.map(img => img.name);

        // 2. Vérifier les animaux déjà pris dans cette classe
        const sqlCheckUsed = `
            SELECT i.name 
            FROM student s 
            JOIN image i ON s.image_id = i.id 
            WHERE s.class_id = ?
        `;

        db.all(sqlCheckUsed, [classId], (errUsed, rowsUsed) => {
            if (errUsed) return res.status(500).json({ error: errUsed.message });

            const animauxPris = rowsUsed.map(row => row.name);
            const animauxDisponibles = touteslesImages.filter(animal => !animauxPris.includes(animal));

            if (animauxDisponibles.length === 0) {
                return res.status(400).json({ error: "Plus d'images disponibles pour cette classe !" });
            }

            // 3. Choix aléatoire
            const animalNameChoisi = animauxDisponibles[Math.floor(Math.random() * animauxDisponibles.length)];

            // 4. Insertion
            createStudent(firstName, animalNameChoisi, classId)
                .then((result) => {
                    res.json({
                        id: result.insertId,
                        firstName,
                        animalImage: animalNameChoisi,
                        imagePath: result.imagePath,
                        message: "Élève ajouté avec succès !"
                    });
                })
                .catch(errCreate => res.status(500).json({ error: errCreate.message }));
        });
    });
});

// --- MISE À JOUR PROGRESSION ---
app.post('/api/update-progress', (req, res) => {
    const { studentId, levelId, isSuccess } = req.body;

    saveProgress(studentId, levelId, isSuccess)
        .then((result) => {
            res.json({
                success: true,
                count: result.count || 0,
                completed: result.completed || false,
                bravo: result.completed
            });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});


app.listen(3000, () => {
    console.log('Serveur SQLite démarré sur le port 3000');
});