//function to create circles for each exercise type, modified to work with database data
function loadexercises(sectionid, data, btncolour, exerciseType) {
    const grid = document.getElementById(sectionid);

    if (!grid) return; // Security check if element doesn't exist

    grid.innerHTML = ''; //clear grid

    // Check if data is an array (from DB) or a number (legacy fixed count)
    // If it's a number, create a dummy array to keep the loop logic working
    const levels = Array.isArray(data) ? data : Array.from({length: data}, (_, i) => ({id: i + 1}));

    if (levels.length === 0) {
        grid.innerHTML = "<p>Aucun exercice trouvé.</p>";
        return;
    }

    levels.forEach((level, index) => { //loops through levels data (*replaced fixed number with foreach from db)
        const circle = document.createElement('div'); //creates circle
        circle.className = 'exercise-circle';


        circle.textContent = index + 1; // Displays 1, 2, 3... based on index


        Object.assign(circle.style, {
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            fontSize: '1.3rem',
            backgroundColor: 'white',
            border: '3px solid #333',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '2px 2px 0px #000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: '0.15s',
            padding: '0',
            margin: '5px'
        });

        circle.addEventListener('mouseenter', () => {
            circle.style.transform = 'translateY(-2px)';
            circle.style.backgroundColor = btncolour;
        });

        circle.addEventListener('mouseleave', () => {
            circle.style.transform = 'translateY(0px)';
            circle.style.backgroundColor = 'white';
        });

        circle.addEventListener('mousedown', () => {
            circle.style.transform = 'translate(2px, 2px)';
            circle.style.boxShadow = 'none';
        });

        circle.addEventListener('mouseup', () => {
            circle.style.transform = 'translateY(-2px)';
            circle.style.boxShadow = '2px 2px 0px #000';

            // Logic to launch the specific level if ID and Type exist
            if (level.id && typeof level.id !== 'undefined' && exerciseType) {
                // Example: /play/classification2/45
                window.location.href = `/play/${exerciseType}/${level.id}`;
            } else {
                console.log("Exercice fictif ou type inconnu (pas de redirection BDD)");
            }
        });

        grid.appendChild(circle);
    });
}

// Helper function to fetch exercises from DB
async function fetchAndLoad(sectionId, exerciseName, exerciseTypeRoute, fallbackCount, color) {
    try {
        // Calls the API created in app.js to get real levels
        const response = await fetch(`/api/exercises/${encodeURIComponent(exerciseName)}/levels`);
        if (!response.ok) throw new Error('Erreur réseau');

        const levels = await response.json();
        // Load the grid with the exact number of levels found and pass the route type
        loadexercises(sectionId, levels, color, exerciseTypeRoute);
    } catch (error) {
        console.error("Erreur chargement exercices:", error);
        // Fallback: load the fixed number if DB fails or exercise name not found
        loadexercises(sectionId, fallbackCount, color, null);
    }
}

//Classifications
const path = window.location.pathname;

switch (path) {
    case "/classification":
        // 1. "Pareils ou différents" (Si tu as créé la logique backend pour classification1)
        // Sinon, utilise 'null' à la place de 'classification1' si la page de jeu n'existe pas encore
        fetchAndLoad('exercises-grid-pareils', 'Pareils ou différents', 'classification1', 30, '#ffdc7d');

        // 2. "Quel est le point commun ?" (classification2)
        fetchAndLoad('exercises-grid-commun', 'Quel est le point commun ?', 'classification2', 30, '#ffdc7d');

        // Static count for others (until they are added to DB)
        loadexercises('exercises-grid-images', 30, '#ffdc7d')
        loadexercises('exercises-grid-pile', 30, '#ffdc7d')
        break;

    case "/conservation":
        loadexercises('exercises-bonne-phrase', 20, '#ffd9f7')
        loadexercises('exercises-trou-phrase', 20, '#ffd9f7')
        loadexercises('exercises-moins-autant-plus', 20, '#ffd9f7')
        loadexercises('exercises-bonne-situation', 20, '#ffd9f7')
        loadexercises('exercises-trou-phrase2', 20, '#ffd9f7')
        loadexercises('exercises-complete', 20, '#ffd9f7')
        break;
}