const API_URL = 'http://localhost:5000';
// User management
let currentUser = null;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
}

if (registerLink) {
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        showRegistrationForm();
    });
}

if (loginLink) {
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        registerModal.hide();
        showLoginForm();
    });
}

// Functions
function showLoginForm() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

function showRegistrationForm() {
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType })
        });

        const data = await response.json();

        if (response.ok) {
            // Connexion réussie
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            // Fermer la modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            // Rediriger selon le type d'utilisateur
            if (data.user.userType === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            } else {
                window.location.href = 'student-dashboard.html';
            }
        } else {
            alert(data.message || 'Erreur lors de la connexion.');
        }
    } catch (err) {
        alert('Erreur réseau ou serveur.');
    }
}

async function handleRegistration(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const userType = document.getElementById('regUserType').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, userType })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Inscription réussie ! Connectez-vous.');
            // Fermer la modal d'inscription
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            registerModal.hide();
            showLoginForm();
        } else {
            alert(data.message || "Erreur lors de l'inscription.");
        }
    } catch (err) {
        alert('Erreur réseau ou serveur.');
    }
}
