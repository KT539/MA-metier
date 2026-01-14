import express from 'express';
import * as db from '../../database/Database.js';

const router = express.Router();

// Récupérer les élèves d'une classe
router.get('/:classId', async (req, res) => {
    try {
        const students = await db.getStudentsByClass(req.params.classId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un élève
router.post('/', async (req, res) => {
    const { firstName, classId } = req.body;
    // Logique simplifiée pour l'image (à améliorer avec scan dossier si besoin)
    const defaultImage = "chat_jaune.png";

    try {
        const studentId = await db.createStudent(firstName, defaultImage, classId);
        res.json({ success: true, id: studentId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer la progression d'une classe
router.get('/progress/:classId', async (req, res) => {
    try {
        const progress = await db.getClassProgress(req.params.classId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;