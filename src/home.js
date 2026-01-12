import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Route to home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Mock API to temporarily simulate students
router.get('/api/students', (req, res) => {
    const fakeStudents = [
        { id: 1, prenom: "Lucas" },
        { id: 2, prenom: "Emma" },
        { id: 3, prenom: "Nathan" }
    ];
    res.json(fakeStudents);
});

export default router;