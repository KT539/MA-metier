import express from 'express';
import fs from 'fs';
import path from 'path';
const router = express.Router();
import { fileURLToPath } from 'url';
// import db, { createStudent, getClassProgress, getStudentsByClass } from '../../database/Sqlite_Deprecated/Database.js';
import db, { createStudent, getClassProgress, getStudentsByClass } from '../../database/LinkWithDatabaseSql.js';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définition du chemin pour les images
const dossierStatic = path.join(__dirname, '../../public/images/animaux');
app.use(express.static(dossierStatic));


// Récupérer les élèves d'une classe
router.get('/:classId', async (req, res) => {
    try {
        const students = await getStudentsByClass(req.params.classId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ajouter un élève
router.post('/', async (req, res) => {
    const { name, classId } = req.body;
    if (!name || !classId) {
        return res.status(400).json({ error: "Prénom et ID classe requis" });
    }

    try {
        // 1. Lire les fichiers dans le dossier
        let files = [];
        try {
            files = fs.readdirSync(dossierStatic);
        } catch (e) {
            console.error("Erreur lecture dossier images:", e);
            return res.status(500).json({ error: "Dossier images introuvable sur le serveur." });
        }
        // On ne garde que les images
        const imageFiles = files.filter(file =>
            file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg')
        );

        // 2. Vérifier en BDD les animaux déjà pris par d'autres élèves
        // On récupère le nom de l'image (ex: 'chat bleu fonce') via l'ID stocké.
        const animauxPris = await new Promise((resolve, reject) => {
            const sql = `SELECT i.name 
                         FROM student s 
                         JOIN image i ON s.image_id = i.id`;

            db.query(sql, [], (dbErr, rows) => {
                if (dbErr) reject(dbErr);
                else resolve(rows.map(row => row.name)); // Retourne liste : ['chat bleu fonce', 'chien brun', ...]
            });
        });

        // 3. Trouver les images disponibles
        // On filtre les fichiers du dossier en comparant leur "nom converti" avec la liste de la BDD.
        const fichiersDisponibles = imageFiles.filter(filename => {
            // Conversion : 'chat_bleu_fonce.png' -> 'chat bleu fonce' pour correspondre à la BDD
            const nomFormatBDD = filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
            return !animauxPris.includes(nomFormatBDD);
        });

        if (fichiersDisponibles.length === 0) {
            return res.status(400).json({
                error: "Désolé, tous les avatars sont déjà pris ! Ajoutez de nouvelles images."
            });
        }

        // 4. Choix aléatoire d'un fichier (ex: 'lapin_rose.png')
        const fichierChoisi = fichiersDisponibles[Math.floor(Math.random() * fichiersDisponibles.length)];

        // 5. Création de l'élève
        const nomPourBDD = fichierChoisi.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

        const studentId = await createStudent(name, nomPourBDD, classId);

        // On renvoie le fichier (pour l'affichage web) et l'ID
        res.json({ success: true, id: studentId, image: fichierChoisi });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Récupérer la progression d'une classe
router.get('/progress/:classId', async (req, res) => {
    try {
        const progress = await getClassProgress(req.params.classId);
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;