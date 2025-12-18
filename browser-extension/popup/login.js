/**
 * CyberShield Login Script
 * Handles user authentication in the browser extension
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const openRegister = document.getElementById('openRegister');
    const backToPopup = document.getElementById('backToPopup');

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtn.textContent = 'Iniciando sesión...';
        hideError();

        try {
            // Use the api.js login method
            const result = await api.login(email, password);

            if (result.success) {
                // Login successful - save user info and redirect
                await chrome.storage.local.set({
                    userEmail: email,
                    loginTime: Date.now()
                });

                // Redirect back to main popup
                window.location.href = 'popup.html';
            } else {
                // Login failed
                showError(result.error || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
        } finally {
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.textContent = 'Iniciar Sesión';
        }
    });

    // Open registration page
    openRegister.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({
            url: 'http://localhost:3000/register'
        });
    });

    // Back to popup
    backToPopup.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'popup.html';
    });

    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }
});
