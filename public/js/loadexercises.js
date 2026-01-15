//function to create circles for each exercise type, will need to modify to have it work with database data
function loadexercises(sectionid, numberOfCircles) {
    const grid = document.getElementById(sectionid);
    
    grid.innerHTML = ''; //clear grid

    for (let i = 1; i <= numberOfCircles; i++) { //defines number of circles (*replace with foreach exercise from db)
        const circle = document.createElement('div'); //creates circle
        circle.className = 'exercise-circle';
        
       
        circle.textContent = i;


        Object.assign(circle.style, {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#ffffffff',
            color: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '3px',
            fontSize: '1.2rem',
            fontWeight: 'bold'
        });

        grid.appendChild(circle);
    }
}

//Classifications
const path = window.location.pathname;

switch (path) {
    case "/classification":
        loadexercises('exercises-grid-pareils', 30)
        loadexercises('exercises-grid-commun', 30)
        loadexercises('exercises-grid-images', 30)
        loadexercises('exercises-grid-pile', 30)
        break;
        
    case "/conservation":
        loadexercises('exercises-bonne-phrase', 20)
        loadexercises('exercises-trou-phrase', 20)
        loadexercises('exercises-moins-autant-plus', 20)
        loadexercises('exercises-bonne-situation', 20)
        loadexercises('exercises-trou-phrase2', 20)
        loadexercises('exercises-complete', 20)
        break;
}






