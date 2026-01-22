import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createLevelHTMLPage = (levelId, exerciseId, categoryId, image1Name, image2Name, correctAnswer) => {
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Niveau ${levelId}</title>
    <link rel="stylesheet" href="/CSS/classification1_levels.css">
</head>
<body>
<div class="container">
    <a href="/classification" class="arrow" title="Retour">←</a>
    
    <h1>Pareils ou différents ?</h1>
    <p class="subtitle">Forme - couleur</p>
    
    <div class="instructions">
        <span class="speaker-icon">🔊</span>
        <p>Les dessins, sont-ils pareils ou différents ?<br>Clique sur le bon symbole.</p>
    </div>
    
    <div class="level-preview">
        <div class="image-box">
            <img src="/images/shapes/${image1Name}.png" alt="${image1Name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="image-placeholder" style="display:none;">${image1Name}</div>
        </div>
        
        <div class="answer-buttons">
            <button class="answer-btn ${correctAnswer === 1 ? 'correct' : ''}" data-answer="1">
                <span class="equal-sign">=</span>
            </button>
            <button class="answer-btn ${correctAnswer === 0 ? 'correct' : ''}" data-answer="0">
                <span class="not-equal-sign">≠</span>
            </button>
        </div>
        
        <div class="image-box">
            <img src="/images/shapes/${image2Name}.png" alt="${image2Name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="image-placeholder" style="display:none;">${image2Name}</div>
        </div>
    </div>
    <div class="actions">
        <a href="/classification" class="btn btn-primary">Valider ma réponse</a>
    </div>
</div>
</body>
</html>`;

    // path
    const viewsDir = path.join(__dirname, '../views/create_exercises/exercise_views');

    // create folder if it doesnt exist
    if (!fs.existsSync(viewsDir)) {
        fs.mkdirSync(viewsDir, { recursive: true });
    }

    // dynamically build the file's name with the parameter id
    const fileName = `classification1_level${levelId}.html`;

    const filePath = path.join(viewsDir, fileName);

    try {
        fs.writeFileSync(filePath, htmlContent);
        console.log(`Fichier généré avec succès : ${fileName}`);
        return filePath;
    } catch (error) {
        console.error("Erreur lors de l'écriture du fichier HTML:", error);
        throw error;
    }
};