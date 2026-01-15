import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes API
import authRoutes from './src/routes/auth.js';
import classRoutes from './src/routes/classes.js';
import studentRoutes from './src/routes/students.js'

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PAGES HTML ---
// (Ces routes servent juste les fichiers HTML, pas de logique métier ici)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/teacher-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/teacher.html'));
});

app.get('/student-area', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/student.html'));
});

app.get('/classification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/classification.html'));
});

app.get('/conservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/conservation.html'));
});

// --- API ROUTES ---
// On utilise les fichiers créés dans src/routes

app.use('/api', authRoutes);         // Gère /api/login, /api/register
app.use('/api/classes', classRoutes); // Gère /api/classes
app.use('/api/students', studentRoutes); // Gère /api/students

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré : http://localhost:${PORT}`);
});