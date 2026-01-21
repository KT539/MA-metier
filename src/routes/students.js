import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import db, { createStudent, getClassProgress, getStudentsByClass, updateStudent, deleteStudent } from '../../database/LinkWIthDatabaseSql.js';

const router = express.Router();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Récupérer les élèves d'une classe ---
router.get('/:classId', async (req, res) => {
    try {
        const students = await getStudentsByClass(req.params.classId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Ajouter un élève (RESTRICTION ID 1 à 25) ---
router.post('/', async (req, res) => {
    const { name, classId } = req.body;
    if (!name || !classId) {
        return res.status(400).json({ error: "Prénom et ID classe requis" });
    }

    try {
        // A. On ne récupère que les images avec ID de 1 à 25
        const imagesAvatars = await new Promise((resolve, reject) => {
            const sql = "SELECT name FROM image WHERE id BETWEEN 1 AND 25";
            db.query(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.name));
            });
        });

        if (imagesAvatars.length === 0) {
            return res.status(500).json({ error: "Aucune image trouvée entre l'ID 1 et 25." });
        }

        // B. Récupérer les images DÉJÀ PRISES par les élèves
        const imagesPrises = await new Promise((resolve, reject) => {
            const sql = `SELECT i.name FROM student s JOIN image i ON s.image_id = i.id`;
            db.query(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.name));
            });
        });

        // C. Trouver les dispos (Différence entre les 25 avatars et ceux pris)
        const animauxDisponibles = imagesAvatars.filter(img => !imagesPrises.includes(img));

        if (animauxDisponibles.length === 0) {
            return res.status(400).json({ error: "Plus d'avatars disponibles (les 25 sont pris) !" });
        }

        // D. Choix aléatoire
        const animalChoisi = animauxDisponibles[Math.floor(Math.random() * animauxDisponibles.length)];
        const studentId = await createStudent(name, animalChoisi, classId);

        res.json({ success: true, id: studentId, image: animalChoisi });

    } catch (err) {
        console.error("Erreur POST student:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 3. MODIFIER UN ÉLÈVE ---
router.put('/:id', async (req, res) => {
    const { name, classId } = req.body;
    const studentId = req.params.id;

    if (!name || !classId) return res.status(400).json({ error: "Données incomplètes" });

    try {
        await updateStudent(studentId, name, classId);
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur PUT student:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 4. SUPPRIMER UN ÉLÈVE ---
router.delete('/:id', async (req, res) => {
    try {
        await deleteStudent(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur DELETE student:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- 5. Récupérer la progression ---
router.get('/progress/:classId', async (req, res) => {
    try {
        const progress = await getClassProgress(req.params.classId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;