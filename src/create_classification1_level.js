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
            <button type="button" class="answer-btn" data-value="0">
                <span class="symbol">=</span>
            </button>
            <button type="button" class="answer-btn" data-value="1">
                <span class="symbol">≠</span>
            </button>
        </div>

        <input type="hidden" id="user-selection" name="correct_answer" value="">
        
        <div class="image-box">
            <img src="/images/shapes/${image2Name}.png" alt="${image2Name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="image-placeholder" style="display:none;">${image2Name}</div>
        </div>
    </div>

    <div class="actions">
        <button id="validate-btn" class="btn btn-primary" disabled>Valider ma réponse</button>
    </div>
</div>

<script>
    const buttons = document.querySelectorAll('.answer-btn');
    const hiddenInput = document.getElementById('user-selection');
    const validateBtn = document.getElementById('validate-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Désélectionner les autres
            buttons.forEach(b => b.classList.remove('selected'));
            
            // Sélectionner celui-ci
            btn.classList.add('selected');
            
            // Stocker la valeur (0 ou 1)
            hiddenInput.value = btn.getAttribute('data-value');
            
            // Activer le bouton valider
            validateBtn.removeAttribute('disabled');
            validateBtn.style.opacity = "1";
            validateBtn.style.cursor = "pointer";
        });
    });

    validateBtn.addEventListener('click', () => {
        const finalAnswer = hiddenInput.value;
        console.log("Réponse enregistrée pour la DB :", finalAnswer);
        // Ici vous pouvez ajouter votre fetch() pour envoyer finalAnswer à votre API
        window.location.href = "/classification"; 
    });
</script>
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