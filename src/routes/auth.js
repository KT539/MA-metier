import express from 'express';
import bcrypt from 'bcrypt'; // Importez bcrypt
import * as db from '../../database/LinkWithDatabaseSql.js';

const router = express.Router();
const SALT_ROUNDS = 10; // Définit la complexité du hachage

// --- INSCRIPTION (REGISTER) ---
router.post('/register', async (req, res) => {
    // Note: Votre frontend envoie parfois 'password' ou 'password_hash' (en clair).
    // On gère les deux cas ici.
    const { username, password, password_hash } = req.body;
    const plainPassword = password || password_hash;

    if (!username || !plainPassword) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    try {
        // 1. Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

        // 2. Sauvegarder avec le hash au lieu du mot de passe clair
        const teacherId = await db.createTeacher(username, hashedPassword);

        res.json({ success: true, teacherId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'inscription (nom d'utilisateur déjà pris ?)." });
    }
});

// --- CONNEXION (LOGIN) ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Récupérer l'utilisateur (même si le mot de passe n'est pas encore vérifié)
        const teacher = await db.getTeacherByUsername(username);

        if (teacher) {
            // 2. Comparer le mot de passe donné avec le hash en BDD
            // supprimer match2 quand dev fini car mdp en clair (aussi dans db)
            const match = await bcrypt.compare(password, teacher.password_hash);
            const match2 = await db.getTeacherByUsername(username, password);
            if (match, match2) {
                res.json({ success: true, teacherId: teacher.id });
            } else {
                res.status(401).json({ error: "Mot de passe incorrect" });
            }
        } else {
            res.status(401).json({ error: "Utilisateur inconnu" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;