// Fonction principale pour créer les cercles
function loadexercises(sectionid, data, btncolour, exerciseType, completedIds = []) {
    const grid = document.getElementById(sectionid);
    if (!grid) return;

    grid.innerHTML = '';

    // Gestion données tableau ou nombre fixe
    // Si data est un nombre (fallback), on crée un tableau d'objets avec des IDs
    const levels = Array.isArray(data) ? data : Array.from({length: data}, (_, i) => ({id: i + 1}));

    if (levels.length === 0) {
        grid.innerHTML = "<p>Aucun exercice trouvé.</p>";
        return;
    }

    const safeCompletedIds = Array.isArray(completedIds) ? completedIds : [];

    levels.forEach((level, index) => {
        const circle = document.createElement('div');
        circle.className = 'exercise-circle';
        circle.textContent = index + 1;

        // --- LOGIQUE DE VERROUILLAGE & COULEUR ---

        // 1. Terminé ?
        const isCompleted = level.id && safeCompletedIds.includes(level.id);

        // 2. Débloqué ?
        // Règle : Le niveau 1 est toujours ouvert.
        // Le niveau N est ouvert SI le niveau N-1 est terminé.
        let isLocked = false;

        if (index > 0) {
            const prevLevelId = levels[index - 1].id;
            // Si le niveau précédent existe et qu'il n'est PAS fini, on verrouille l'actuel
            if (prevLevelId && !safeCompletedIds.includes(prevLevelId)) {
                isLocked = true;
            }
        }

        // --- STYLES ---
        let bgColor = 'white';
        let borderColor = '#333';
        let cursorStyle = 'pointer';
        let opacity = '1';

        if (isCompleted) {
            bgColor = '#4CAF50'; // Vert
            circle.style.color = 'white';
            borderColor = '#2E7D32';
        } else if (isLocked) {
            bgColor = '#ddd';
            borderColor = '#999';
            cursorStyle = 'not-allowed';
            opacity = '0.6';
        }

        Object.assign(circle.style, {
            width: '55px', height: '55px', borderRadius: '50%',
            fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: bgColor,
            border: `3px solid ${borderColor}`,
            boxShadow: isLocked ? 'none' : '2px 2px 0px #000',
            cursor: cursorStyle,
            opacity: opacity,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transition: '0.15s', margin: '5px',
            userSelect: 'none'
        });

        // --- EVENTS ---
        if (!isLocked) {
            circle.addEventListener('mouseenter', () => {
                if (!isCompleted) circle.style.backgroundColor = btncolour;
                circle.style.transform = 'translateY(-2px)';
            });

            circle.addEventListener('mouseleave', () => {
                circle.style.backgroundColor = isCompleted ? '#4CAF50' : 'white';
                circle.style.transform = 'translateY(0px)';
            });

            circle.addEventListener('mousedown', () => {
                circle.style.transform = 'translate(2px, 2px)';
                circle.style.boxShadow = 'none';
            });

            circle.addEventListener('mouseup', () => {
                circle.style.transform = 'translateY(-2px)';
                circle.style.boxShadow = '2px 2px 0px #000';

                // Redirection
                if (level.id && exerciseType) {
                    window.location.href = `/play/${exerciseType}/${level.id}`;
                } else {
                    console.log("Exercice fictif ou type inconnu (pas de redirection)");
                    // Optionnel : Alert pour dire que c'est un test
                }
            });
        }

        grid.appendChild(circle);
    });
}

// Fonction Helper
async function fetchAndLoad(sectionId, exerciseName, exerciseTypeRoute, fallbackCount, color) {
    const studentId = sessionStorage.getItem('currentStudentId');

    try {
        // A. Charger les NIVEAUX
        const responseLevels = await fetch(`/api/exercises/${encodeURIComponent(exerciseName)}/levels`);
        if (!responseLevels.ok) throw new Error('Erreur réseau niveaux');

        const levels = await responseLevels.json();
        if (!levels || levels.length === 0) {
            throw new Error("Aucun niveau en BDD -> Utilisation du fallback");
        }
        // ------------------

        // B. Charger la PROGRESSION
        let completedIds = [];
        if (studentId) {
            try {
                const responseProg = await fetch(`/api/students/${studentId}/progress/${encodeURIComponent(exerciseName)}`);
                if (responseProg.ok) {
                    completedIds = await responseProg.json();
                }
            } catch (err) {
                console.error("Erreur chargement progression:", err);
            }
        }

        loadexercises(sectionId, levels, color, exerciseTypeRoute, completedIds);

    } catch (error) {
        console.log("Aucun exercice trouvé pour : " + exerciseName);

        // On récupère la zone d'affichage
        const grid = document.getElementById(sectionId);

        // Option A : On affiche un message pour dire en construction
        if (grid) {
            grid.innerHTML = '<p style="font-style:italic; color:gray;">Aucun exercice disponible pour le moment.</p>';
        }

        // Option B : On cache complètement la section
        // if (grid) grid.style.display = 'none';
    }
}

// --- INITIALISATION ---
const path = window.location.pathname;

switch (path) {
    case "/classification":
        fetchAndLoad('exercises-grid-pareils', 'Pareils ou différents ?', 'classification1', 30, '#ffdc7d');
        fetchAndLoad('exercises-grid-commun', 'Quel est le point commun ?', 'classification2', 30, '#ffdc7d');

        // Exercices statiques
        fetchAndLoad('exercises-grid-images', 'la bonne image','classification3', 30, '#ffdc7d');

        // Exercice 4 : Sur la pile (Dynamique)
        fetchAndLoad('exercises-grid-pile', 'Sur la pile', 'classification4', 30, '#ffdc7d');
        break;

    case "/conservation":
        // Fallbacks simples pour l'instantS
        loadexercises('exercises-bonne-phrase', 20, '#ffd9f7', null, []);
        loadexercises('exercises-trou-phrase', 20, '#ffd9f7', null, []);
        loadexercises('exercises-moins-autant-plus', 20, '#ffd9f7', null, []);
        loadexercises('exercises-bonne-situation', 20, '#ffd9f7', null, []);
        loadexercises('exercises-trou-phrase2', 20, '#ffd9f7', null, []);
        loadexercises('exercises-complete', 20, '#ffd9f7', null, []);
        break;
}