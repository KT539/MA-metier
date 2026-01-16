//function to create circles for each exercise type, will need to modify to have it work with database data
function loadexercises(sectionid, numberOfCircles, btncolour) {
    const grid = document.getElementById(sectionid);
    
    grid.innerHTML = ''; //clear grid

    for (let i = 1; i <= numberOfCircles; i++) { //defines number of circles (*replace with foreach exercise from db)
        const circle = document.createElement('div'); //creates circle
        circle.className = 'exercise-circle';
        
       
        circle.textContent = i;


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
        });



        grid.appendChild(circle);
    }
}

//Classifications
const path = window.location.pathname;

switch (path) {
    case "/classification":
        loadexercises('exercises-grid-pareils', 30, '#ffdc7d')
        loadexercises('exercises-grid-commun', 30, '#ffdc7d')
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






