document.addEventListener('DOMContentLoaded', () => {
    // Sélection du bouton de création de compte
    const createBtn = document.getElementById('btn-create-account');

    if (createBtn) {
        createBtn.addEventListener('click', async (event) => {
            event.preventDefault(); // Empêche tout comportement par défaut

            // Récupération des valeurs des champs inputs (via leurs IDs)
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Vérification que les champs ne sont pas vides
            if (!username || !password) {
                alert("Veuillez remplir l'identifiant et le mot de passe pour créer un compte.");
                return;
            }

            // Préparation des données à envoyer
            const data = {
                username: username,
                password_hash: password // envoyé en clair mais oke
            };

            try {
                // Appel à votre serveur Database.js
                const response = await fetch('/api/add-teacher', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
                    // Pour vider les champs une fois la validation terminée
                    usernameInput.value = '';
                    passwordInput.value = '';
                } else {
                    alert("Erreur lors de la création : " + (result.error || "Erreur inconnue"));
                }

            } catch (error) {
                console.error("Erreur réseau :", error);
                alert("Impossible de contacter le serveur (vérifiez que Database.js tourne bien sur le port 3000).");
            }
        });
    }
});