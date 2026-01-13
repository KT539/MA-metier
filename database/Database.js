const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Définition du chemin pour les images
const dossierStatic = path.join(__dirname, 'public');
app.use(express.static(dossierStatic));

// Connexion à la base de données
const db = new sqlite3.Database('./ecole_echallens.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connecté à la base de données SQLite.');
});

// Chemin vers le dossier des animaux
const images_animaux = path.join(__dirname, 'images', 'animaux page accueil PNG');

// --- ROUTE 1 : AJOUTER UN ÉLÈVE ---
app.post('/api/add-student', (req, res) => {
    const { teacherId, firstName } = req.body;

    // 1. Lire le dossier
    fs.readdir(images_animaux, (err, files) => {
        if (err) {
            console.error("Erreur lecture dossier:", err.message);
            return res.status(500).json({ error: "Impossible de lire le dossier images" });
        }

        // Séléction des images dans le dossier (PNG ou JPG)
        const touteslesImages = files.filter(file =>
            file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')
        );

        // 2. Vérifier en BDD les animaux déjà pris
        const sqlCheck = `SELECT animal_image FROM student`;

        db.all(sqlCheck, [], (dbErr, rows) => {
            if (dbErr) return res.status(500).json({ error: dbErr.message });

            const animauxPris = rows.map(row => row.animal_image);

            // 3. Trouver les images disponibles
            const animauxDisponibles = touteslesImages.filter(animal => !animauxPris.includes(animal));

            if (animauxDisponibles.length === 0) {
                return res.status(400).json({
                    error: "Plus d'images disponibles ! Ajoutez de nouveaux fichiers dans le dossier."
                });
            }

            // 4. Choix aléatoire de l'image
            const animalChoisi = animauxDisponibles[Math.floor(Math.random() * animauxDisponibles.length)];

            // 5. Insertion des valeurs
            const sqlInsertStudent = `INSERT INTO student (teacher_id, first_name, animal_image) VALUES (?, ?, ?)`;

            db.run(sqlInsertStudent, [teacherId, firstName, animalChoisi], function(insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });

                // on renvoie les infos au frontend pour l'affichage immédiat
                res.json({
                    id: this.lastID,
                    firstName,
                    animalImage: animalChoisi,
                    message: "Élève ajouté avec succès !"
                });
            });
        });
    });
});

// sign_in

// Create login prof
app.post('/api/add-teacher', (req, res) => {
    const { username, password_hash } = req.body;
    const sqlInsertTeacher = `INSERT INTO teacher (username, password_hash) VALUES (?, ?)`;
    db.run(sqlInsertTeacher, [username, password_hash], function(insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
    });
});

// login

// Get login prof
app.get('/api/teachers', (req, res) => {
    const {entry_username, entry_password} = req.body;
    const sqlGetTeacher = `SELECT username, password_hash FROM teacher WHERE username = ? AND password_hash = ?`;
    db.get(sqlGetTeacher, [entry_username, entry_password], (dbErr, rows) => {
        if (dbErr) return res.status(500).json({error: dbErr.message});
    });
});
// Get student
app.get('/api/teachers/', (req, res) => {

})
// --- ROUTE 2 : MISE À JOUR DE LA PROGRESSION ---
app.post('/api/update-progress', (req, res) => {
    const { studentId, moduleName, levelNumber } = req.body;

    const checkSql = `SELECT success_count, is_completed FROM progress 
                      WHERE student_id = ? AND module_name = ? AND level_number = ?`;

    db.get(checkSql, [studentId, moduleName, levelNumber], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row) {
            // Premier succès : initialisation à 1
            const insertSql = `INSERT INTO progress (student_id, module_name, level_number, success_count, is_completed) 
                               VALUES (?, ?, ?, 1, 0)`;
            db.run(insertSql, [studentId, moduleName, levelNumber], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, count: 1, completed: false, bravo: true });
            });
        } else {
            // Succès suivants, incrémentation
            if (row.is_completed) {
                return res.json({ success: true, message: "Niveau déjà terminé", completed: true });
            }

            let newCount = row.success_count + 1;

            // Règle des 5 réussites validée ici
            let completed = newCount >= 5 ? 1 : 0;

            const updateSql = `UPDATE progress SET success_count = ?, is_completed = ? 
                               WHERE student_id = ? AND module_name = ? AND level_number = ?`;

            db.run(updateSql, [newCount, completed, studentId, moduleName, levelNumber], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    success: true,
                    count: newCount,
                    completed: !!completed,
                    bravo: true // Le frontend utilisera ça pour afficher "BRAVO!"
                });
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});