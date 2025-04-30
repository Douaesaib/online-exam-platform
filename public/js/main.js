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

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    // For demo purposes, we'll use localStorage
    // In a real application, this would be an API call
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password && u.userType === userType);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Close the modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Redirect based on user type
        if (userType === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const userType = document.getElementById('regUserType').value;

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('User already exists. Please login instead.');
        return;
    }

    // Add new user
    users.push({
        name,
        email,
        password,
        userType
    });

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Close the registration modal
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();

    alert('Registration successful! Please login.');
    showLoginForm();
}
