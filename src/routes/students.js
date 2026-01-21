import express from 'express';
import fs from 'fs';
import path from 'path';
const router = express.Router();
import { fileURLToPath } from 'url';
// import db, { createStudent, getClassProgress, getStudentsByClass } from '../../database/Sqlite_Deprecated/Database.js';
import db, { createStudent, getClassProgress, getStudentsByClass } from '../../database/LinkWIthDatabaseSql.js';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définition du chemin pour les images
const dossierStatic = path.join(__dirname, '../../public/images/animaux');
app.use(express.static(dossierStatic));


// Récupérer les élèves d'une classe
router.get('/:classId', async (req, res) => {
    try {
        const students = await getStudentsByClass(req.params.classId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un élève
router.post('/', async (req, res) => {
    const { name, classId } = req.body;
    if (!name || !classId) {
        return res.status(400).json({ error: "Prénom et ID classe requis" });
    }

    try {
        let files = [];
        try {
            files = fs.readdirSync(dossierStatic);
        } catch (e) {
            console.error("Erreur lecture dossier images:", e);
            return res.status(500).json({ error: "Dossier images introuvable sur le serveur." });
        }
        // 1. Sélection des images dans le dossier (PNG ou JPG)
        const touteslesImages = files.filter(file =>
            file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')
        );

        // 2. Vérifier en BDD les animaux déjà pris
        const animauxPris = await new Promise((resolve, reject) => {
            db.query(`SELECT animal_image FROM student`, [], (dbErr, rows) => {
                if (dbErr) reject(dbErr);
                else resolve(rows.map(row => row.animal_image));
            });
        });

        // 3. Trouver les images disponibles
        const animauxDisponibles = touteslesImages.filter(animal => !animauxPris.includes(animal));

        if (animauxDisponibles.length === 0) {
            return res.status(400).json({
                error: "Désolé, tous les avatars sont déjà pris ! Ajoutez de nouvelles images."
            });
        }

        // 4. Choix aléatoire de l'image
        const animalChoisi = animauxDisponibles[Math.floor(Math.random() * animauxDisponibles.length)];

        // 5. Création de l'élève
        const studentId = await createStudent(name, animalChoisi, classId);

        res.json({ success: true, id: studentId, image: animalChoisi });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Récupérer la progression d'une classe
router.get('/progress/:classId', async (req, res) => {
    try {
        const progress = await getClassProgress(req.params.classId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;