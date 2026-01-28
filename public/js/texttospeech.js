const synth = window.speechSynthesis;

function speak(elementId) {
    const element = document.getElementById(elementId);
    
    if (element) {
        const utterance = new SpeechSynthesisUtterance(element.textContent);
        
        synth.speak(utterance);
    } else {
        console.error("Could not find element with ID:", elementId);
    }
}