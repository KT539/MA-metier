import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes API
import authRoutes from './src/routes/auth.js';
import classRoutes from './src/routes/classes.js';
import studentRoutes from './src/routes/students.js'
import { getShapesImages, createLevel } from './database/LinkWithDatabaseSql.js';
import { createLevelHTMLPage} from "./src/create_classification1_level.js";

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

app.get('/api/shapes-images', async (req, res) => {
    try {
        const images = await getShapesImages();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des images" });
    }
});

// dynamic route for created levels of classification exercise 1
app.get('/exercise/classification1/level/:id', (req, res) => {
    const levelId = req.params.id;
    const fileName = `classification1_level${levelId}.html`;
    const filePath = path.join(__dirname, 'views/create_exercises/exercise_views', fileName);

    // check if file exists
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Fichier non trouvé:", filePath);
            res.status(404).send("<h1>Erreur 404</h1><p>Ce niveau n'existe pas encore.</p>");
        }
    });
});

// POST route to create a new level
app.post('/api/create-level', async (req, res) => {
    try {
        const { exercise_id, category_id, image_id_1, image_id_2, correct_answer } = req.body;

        // validation
        if (!exercise_id || !category_id || !image_id_1 || !image_id_2 || correct_answer === undefined) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        // create the level in the database
        const levelId = await createLevel(
            parseInt(exercise_id),
            parseInt(category_id),
            parseInt(image_id_1),
            parseInt(image_id_2),
            parseInt(correct_answer)
        );

        // get image names
        const images = await getShapesImages();
        const image1 = images.find(img => img.id === parseInt(image_id_1));
        const image2 = images.find(img => img.id === parseInt(image_id_2));

        // create the html page
        createLevelHTMLPage(
            levelId,
            exercise_id,
            category_id,
            image1?.name || 'Image 1',
            image2?.name || 'Image 2',
            parseInt(correct_answer)
        );

        res.json({
            success: true,
            levelId: levelId,
            message: "Niveau créé avec succès !"
        });
    } catch (err) {
        console.error("Erreur lors de la création du niveau:", err);
        res.status(500).json({ error: "Erreur lors de la création du niveau" });
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