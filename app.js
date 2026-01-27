import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import des routes API
import authRoutes from './src/routes/auth.js';
import classRoutes from './src/routes/classes.js';
import studentRoutes from './src/routes/students.js'
import {getShapesImages, createLevel, getLevelsByExerciseName, getCategories, getExerciseIdByName, getLevelById, saveProgress, createLevelPile, getLevelPileById} from './database/LinkWithDatabaseSql.js';

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

app.get('/create_exercises/forms/classification_form4', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/create_exercises/forms/classification_form4.html'));
});

app.get('/api/shapes-images', async (req, res) => {
    try {
        const images = await getShapesImages();
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des images" });
    }
});

app.get('/api/exercises/:name/levels', async (req, res) => {
    try {
        const exerciseName = req.params.name;
        const levels = await getLevelsByExerciseName(exerciseName);
        res.json(levels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de la récupération des niveaux" });
    }
});

// Route pour afficher la page de jeu classification1
app.get('/play/classification1/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/create_exercises/exercise_views/classification1_view.html'));
});

// Sauvegarder un niveau "Pareils ou différents ?" (Classification 1)
app.post('/api/create/classification1', async (req, res) => {
    try {
        // correctAnswer : 1 pour "Pareils (=)", 0 pour "Différents (≠)"
        const { image1Id, image2Id, correctAnswer } = req.body;

        // Récupérer l'ID de l'exercice
        const exerciseId = await getExerciseIdByName("Pareils ou différents ?");

        // Récupérer l'ID de la catégorie "Classification"
        const categories = await getCategories();
        const classificationCat = categories.find(c => c.name === 'Classification');

        if (!exerciseId || !classificationCat) {
            return res.status(500).json({
                error: "Configuration BDD manquante (Exercice 'Pareils ou différents ?' ou Catégorie 'Classification')"
            });
        }

        // Création du niveau
        const newLevelId = await createLevel(
            exerciseId,
            classificationCat.id,
            image1Id,
            image2Id,
            correctAnswer
        );

        res.json({ success: true, id: newLevelId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur création niveau classification 1" });
    }
});

// 1. Récupérer les catégories pour le formulaire
app.get('/api/categories', async (req, res) => {
    try {
        const cats = await getCategories();
        res.json(cats);
    } catch (e) { res.status(500).json({error: e.message}); }
});

// 2. Sauvegarder un niveau "Point Commun" (Classification 2)
app.post('/api/create/classification2', async (req, res) => {
    try {
        // correctAnswer : 0 pour Forme, 1 pour Couleur
        const { image1Id, image2Id, correctAnswer } = req.body;

        // 1. Récupérer l'ID de l'exercice
        const exerciseId = await getExerciseIdByName("Quel est le point commun ?");

        // 2. Récupérer l'ID de la catégorie "Classification"
        const categories = await getCategories();
        const classificationCat = categories.find(c => c.name === 'Classification');

        if (!exerciseId || !classificationCat) {
            return res.status(500).json({error: "Configuration base de données incomplète (Exercice ou Catégorie manquant)"});
        }

        // On crée le niveau avec la bonne réponse (0 ou 1)
        const newLevelId = await createLevel(exerciseId, classificationCat.id, image1Id, image2Id, correctAnswer);

        res.json({ success: true, id: newLevelId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur création niveau" });
    }
});

// 3. Récupérer les infos d'un niveau spécifique pour le jeu
app.get('/api/level/:id', async (req, res) => {
    try {
        const level = await getLevelById(req.params.id);
        if(!level) return res.status(404).json({error: "Niveau introuvable"});
        res.json(level);
    } catch (e) { res.status(500).json({error: e.message}); }
});

// 4. Sauvegarder la progression (Succès/Échec)
app.post('/api/progress', async (req, res) => {
    try {
        const { studentId, levelId, isSuccess } = req.body;
        await saveProgress(studentId, levelId, isSuccess);
        res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
});

// --- ROUTES HTML POUR JOUER ---

// Page de jeu pour "Quel est le point commun ?"
app.get('/play/classification2/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/create_exercises/exercise_views/classification2_view.html'));
});

// --- ROUTE CRÉATION EXERCICE 4 ---
app.post('/api/create/classification4', async (req, res) => {
    try {
        // handImageIds doit être un tableau d'IDs
        const { startImageId, handImageIds } = req.body;

        const exerciseId = await getExerciseIdByName("Sur la pile");
        const categories = await getCategories();
        const classificationCat = categories.find(c => c.name === 'Classification');

        if (!exerciseId || !classificationCat) {
            return res.status(500).json({ error: "Config BDD manquante" });
        }

        const newLevelId = await createLevelPile(
            exerciseId,
            classificationCat.id,
            startImageId,
            handImageIds
        );

        res.json({ success: true, id: newLevelId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// --- ROUTE JEU EXERCICE 4 ---
// Sert la page HTML
app.get('/play/classification4/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/create_exercises/exercise_views/classification4_view.html'));
});

// Sert les données JSON pour le JS du jeu
app.get('/api/exercises/classification4/:id', async (req, res) => {
    try {
        const data = await getLevelPileById(req.params.id);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
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