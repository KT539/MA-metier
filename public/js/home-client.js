const icons = ['🐘', '🦔', '🐧', '🐸', '🐟', '🐭', '🦋', '🐴'];

async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        const students = await response.json();
        const grid = document.getElementById('studentGrid');

        grid.innerHTML = ''; // Vide la grille

        students.forEach(student => {
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const card = document.createElement('div');
            card.className = 'student-slot';
            card.innerHTML = `
                <div class="placeholder-img" style="font-size: 50px; display: flex; justify-content: center; align-items: center;">
                    ${randomIcon}
                </div>
                <p>${student.prenom}</p>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur de chargement des élèves :", error);
    }
}

// Lancement au chargement de la page
loadStudents();