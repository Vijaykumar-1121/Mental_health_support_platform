/**
 * MindWell - auth.js
 * -----------------
 * This file manages all user authentication logic. It handles form submissions for:
 * - User Registration (Sign Up)
 * - User Login
 * - Password Reset
 * It also includes UI logic like password visibility toggling and role switching.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to forms if they exist on the current page.
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
});

// --- NOTIFICATION FUNCTION ---

/**
 * Displays a custom notification message.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success' or 'error').
 */
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = ''; // Clear existing classes
    notification.classList.add(type, 'show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}


// --- Form Handlers ---

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    // In a real app, this data would be sent to the backend for processing.
    console.log("Signup form submitted with:", { name, email });
    showNotification('Thank you for signing up! Please check your email to verify your account.', 'success');
    event.target.reset();
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    
    // In a real app, you would send credentials to your backend for validation.
    console.log('Login attempt with:', email);
    showNotification('Checking your credentials...', 'success');
    // The page will no longer redirect automatically.
    // A backend response would determine the next step.
}

function handleForgotPassword(event) {
    event.preventDefault();
    showNotification("If this email exists, a reset link has been sent.", "success");
    console.log("Password reset requested.");
}

// --- UI Helper Functions (GLOBAL SCOPE) ---

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(`eye-icon-${inputId}`);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.052 10.052 0 013.453-5.118m7.536 7.536A5.005 5.005 0 0017 12c0-1.38-.56-2.63-1.464-3.536m-7.072 7.072A5.005 5.005 0 017 12c0-1.38.56-2.63 1.464-3.536M2 2l20 20" />`;
    } else {
        passwordInput.type = "password";
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    }
}

function switchRole(role) {
    const studentBtn = document.getElementById('student-btn');
    const adminBtn = document.getElementById('admin-btn');
    const adminCodeField = document.getElementById('admin-code-field');
    const adminCodeInput = document.getElementById('admin-code');

    if (role === 'student') {
        studentBtn.classList.add('bg-orange-500', 'text-white');
        studentBtn.classList.remove('bg-transparent', 'text-stone-600');
        adminBtn.classList.add('bg-transparent', 'text-stone-600');
        adminBtn.classList.remove('bg-orange-500', 'text-white');
        adminCodeField.classList.add('hidden');
        adminCodeInput.required = false;
    } else {
        adminBtn.classList.add('bg-orange-500', 'text-white');
        adminBtn.classList.remove('bg-transparent', 'text-stone-600');
        studentBtn.classList.add('bg-transparent', 'text-stone-600');
        studentBtn.classList.remove('bg-orange-500', 'text-white');
        adminCodeField.classList.remove('hidden');
        adminCodeInput.required = true;
    }
}
