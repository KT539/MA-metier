import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes API
import authRoutes from './src/routes/auth.js';
import classRoutes from './src/routes/classes.js';
import studentRoutes from './src/routes/students.js'
import { getShapesImages, createLevel } from './database/LinkWithDatabaseSql.js';

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

app.get('/combinatoire', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/combinatoire.html'));
});

app.get('/classification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/classification.html'));
});
  
app.get('/conservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/conservation.html'));
});

app.get('/exercises_creation', (req, res) => {
    res.sendFile(__dirname + '/views/exercises_creation.html');
});

app.get('/create_exercises/classification_exercises', (req, res) => {
    res.sendFile(__dirname + '/views/create_exercises/classification_exercises.html');
});

app.get('/seriation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/seriation.html'));
});

app.get('/create_exercises/forms/classification_form1', (req, res) => {
    res.sendFile(__dirname + '/views/create_exercises/forms/classification_form1.html');
});

app.get('/create_exercises/forms/classification_form2', (req, res) => {
    res.sendFile(__dirname + '/views/create_exercises/forms/classification_form2.html');
});

app.get('/api/shapes-images', async (req, res) => {
    try {
        const images = await getShapesImages();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des images" });
    }
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