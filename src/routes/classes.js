import express from 'express';
// import * as db from '../../database/Sqlite_Deprecated/Database.js';
import * as db from '../../database/LinkWithDatabaseSql.js';
const router = express.Router();

// Récupérer les classes d'un prof
router.get('/:teacherId', async (req, res) => {
    try {
        const classes = await db.getClassesByTeacher(req.params.teacherId);
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Créer une classe
router.post('/', async (req, res) => {
    const { name, teacherId } = req.body;
    try {
        const newClass = await db.createClass(name, teacherId);
        res.json(newClass);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer les statistiques d'une classe
router.get('/:classId/stats', async (req, res) => {
    try {
        const stats = await db.getClassStatistics(req.params.classId);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activer/Désactiver une classe
router.post('/:classId/toggle', async (req, res) => {
    const { isActive } = req.body;
    try {
        await db.toggleClassStatus(req.params.classId, isActive);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;