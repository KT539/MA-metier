import express from 'express';
import * as db from '../../database/Database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const teacherId = await db.createTeacher(username, password);
        res.json({ success: true, teacherId });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'inscription (utilisateur existe peut-être déjà)." });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const teacher = await db.getTeacherByCredentials(username, password);
        if (teacher) {
            res.json({ success: true, teacherId: teacher.id });
        } else {
            res.status(401).json({ error: "Identifiants incorrects" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;