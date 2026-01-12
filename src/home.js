import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Route pour servir la page d'accueil
router.get('/', (req, res) => {
    // On remonte d'un cran pour aller dans /public
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API temporaire pour simuler les élèves (en attendant SQLite)
router.get('/api/students', (req, res) => {
    const fakeStudents = [
        { id: 1, prenom: "Lucas" },
        { id: 2, prenom: "Emma" },
        { id: 3, prenom: "Nathan" }
    ];
    res.json(fakeStudents);
});

export default router;