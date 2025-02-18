// DOM Elements
const authForm = document.getElementById('authForm');
const authContainer = document.getElementById('authContainer');
const chatContainer = document.getElementById('chatContainer');
const messageContainer = document.getElementById('messageContainer');
const message = document.getElementById('message');
const userEmailDisplay = document.getElementById('userEmail');
const loading = document.getElementById('loading');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const currentDateTime = document.getElementById('currentDateTime');

// Utility Functions
function showLoading() {
    loading.classList.remove('hidden');
    document.querySelectorAll('button').forEach(btn => btn.disabled = true);
}

function hideLoading() {
    loading.classList.add('hidden');
    document.querySelectorAll('button').forEach(btn => btn.disabled = false);
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = `text-sm font-medium p-3 rounded-lg fade-in ${
        isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    }`;
    messageContainer.classList.remove('hidden');
    setTimeout(() => messageContainer.classList.add('hidden'), 5000);
}

function validateInput() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
        showMessage('Please enter an email address.', true);
        return false;
    }
    if (!password) {
        showMessage('Please enter a password.', true);
        return false;
    }
    if (password.length < 6) {
        showMessage('Password should be at least 6 characters long.', true);
        return false;
    }
    return true;
}

function updateDateTime() {
    const now = new Date();
    currentDateTime.textContent = now.toISOString().replace('T', ' ').substr(0, 19) + ' UTC';
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    hideLoading();
    if (user) {
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        userEmailDisplay.textContent = user.email;
        updateDateTime();
        setInterval(updateDateTime, 1000);
        initializeChat();
    } else {
        authContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        userEmailDisplay.textContent = '';
    }
});

// Auth Functions
async function handleSignUp() {
    if (!validateInput()) return;

    showLoading();
    try {
        await auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value);
        showMessage('Account created successfully!');
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        showMessage(error.message, true);
        hideLoading();
    }
}

async function handleSignIn() {
    if (!validateInput()) return;

    showLoading();
    try {
        await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
        showMessage('Signed in successfully!');
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        showMessage(error.message, true);
        hideLoading();
    }
}

async function handleSignOut() {
    try {
        await auth.signOut();
        showMessage('Signed out successfully!');
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Event Listeners
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSignIn();
});