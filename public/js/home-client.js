// list of images in public/images
const iconFiles = [
    'chat_bleu_fonce.png',
    'chat_jaune.png',
    'chien_brun.png',
    'chien_saumon.png',
    'cochon_orange.png',
    'cochon_rose.png',
    'elephant_bleu_clair.png',
    'elephant_violet.png',
    'escargot_rose_fonce.png',
    'escargot_vert_clair.png',
    'grenouille_gris.png',
    'grenouille_vert_fonce.png',
    'herisson_brun.png',
    'herisson_saumon.png',
    'lapin_orange.png',
    'lapin_rose.png',
    'papillon_bleu_fonce.png',
    'papillon_jaune.png',
    'pingouin_gris.png',
    'pingouin_vert_fonce.png',
    'poisson_bleu_clair.png',
    'poisson_violet.png',
    'souris_rose_fonce.png',
    'souris_vert_clair.png'
];

async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        const students = await response.json();
        const grid = document.getElementById('studentGrid');

        grid.innerHTML = ''; // empty the grid

        students.forEach(student => {
            // select a random image
            const randomIcon = iconFiles[Math.floor(Math.random() * iconFiles.length)];

            const card = document.createElement('div');
            card.className = 'student-slot';

            // replace the image with a <img>
            card.innerHTML = `
                <div class="placeholder-img" style="display: flex; justify-content: center; align-items: center;">
                    <img src="/images/${randomIcon}" alt="Icone de ${student.prenom}" style="width: 80%; height: auto;">
                </div>
                <p>${student.prenom}</p>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur de chargement des élèves :", error);
    }
}

// load the page
loadStudents();