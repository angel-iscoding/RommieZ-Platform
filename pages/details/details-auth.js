// ===== EXTENSION OF AUTHENTICATION FOR DETAILS =====

// ===== AUTHENTICATION GUARD =====

// Check if user is authenticated
function checkAuthentication() {
    const sessionData = localStorage.getItem('roomieZ_session');
    if (!sessionData) {
        redirectToLogin();
        return false;
    }
    
    const session = JSON.parse(sessionData);
    // Verify that the session is not too old (24 hours)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('roomieZ_session');
        localStorage.removeItem('roomieZ_userId');
        redirectToLogin();
        return false;
    }
    
    return true;
}

// Redirect to login page
function redirectToLogin() {
    alert('Debes iniciar sesión para acceder a esta página');
    window.location.href = '../../index.html';
}

// ===== SHARED AUTHENTICATION FUNCTIONS =====

// Replicate necessary functions from index.js
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
}

async function checkEmailExists(email) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK_EMAIL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await handleApiResponse(response);
        
        return {
            success: true,
            exists: data.isRegistered,
            message: data.isRegistered ? 'Email found in database' : 'Email not found'
        };
    } catch (error) {
        console.error('Error checking email:', error);
        return {
            success: false,
            exists: false,
            message: 'Error verifying email'
        };
    }
}

async function loginUser(email, password) {
    try {
        const emailCheck = await checkEmailExists(email);
        
        if (!emailCheck.exists) {
            return {
                success: false,
                message: 'Email not found'
            };
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`);
        const data = await handleApiResponse(response);
        
        const user = data.data.find(u => u.email === email && u.password === password);
        
        if (user) {
            return {
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    city: user.city,
                    birthdate: user.birthdate
                },
                message: 'Login successful'
            };
        } else {
            return {
                success: false,
                message: 'Incorrect password'
            };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            message: 'Connection error. Please try again.'
        };
    }
}

async function registerUser(userData) {
    try {
        const emailCheck = await checkEmailExists(userData.email);
        
        if (emailCheck.exists) {
            return {
                success: false,
                message: 'This email is already registered'
            };
        }

        const birthDate = new Date(userData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
        
        if (actualAge < 18) {
            return {
                success: false,
                message: 'You must be at least 18 years old to register'
            };
        }

        const newUser = {
            first_name: userData.firstName,
            middle_name: userData.middleName || null,
            last_name: userData.lastName,
            username: userData.email.split('@')[0],
            email: userData.email,
            password: userData.password,
            city: userData.city || 'Barranquilla',
            birthdate: userData.birthDate,
            role: 'student'
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        });

        const data = await handleApiResponse(response);

        return {
            success: true,
            data: {
                id: data.userId,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                role: newUser.role,
                city: newUser.city,
                birthdate: newUser.birthdate
            },
            message: 'Registration successful'
        };
    } catch (error) {
        console.error('Error during registration:', error);
        return {
            success: false,
            message: error.message || 'Connection error. Please try again.'
        };
    }
}

// Save session in localStorage (extended for details)
function saveSession(userData) {
    const sessionData = {
        user: userData,
        userId: userData.id,
        isAuthenticated: true,
        timestamp: Date.now()
    };
    
    localStorage.setItem('roomieZ_session', JSON.stringify(sessionData));
    localStorage.setItem('roomieZ_userId', userData.id.toString());
    
    currentUser = userData;
    isAuthenticated = true;
    
    // Update UI after login
    updateUIForAuthenticatedUser();
}

// ===== MODAL UI FUNCTIONS =====

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        resetLoginForm();
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        resetLoginForm();
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
        resetRegisterForm();
    }
}

function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('active');
        resetRegisterForm();
    }
}

// ===== FORM FUNCTIONS =====

function resetLoginForm() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.removeAttribute('required');
    }
    if (passwordSection) passwordSection.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Start session';
    clearLoginErrors();
}

function resetRegisterForm() {
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const birthDateInput = document.getElementById('birthDate');
    const cityInput = document.getElementById('city');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (birthDateInput) birthDateInput.value = '';
    if (cityInput) cityInput.value = 'Barranquilla, CO ';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    clearRegisterErrors();
}

function clearLoginErrors() {
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');
    const passwordError = document.getElementById('passwordError');
    const emailInput = document.querySelector('#loginEmail');
    const passwordInput = document.querySelector('#loginPassword');
    
    if (emailError) emailError.classList.remove('show');
    if (emailSuccess) emailSuccess.classList.remove('show');
    if (passwordError) passwordError.classList.remove('show');
    if (emailInput && emailInput.parentElement) emailInput.parentElement.classList.remove('error', 'success');
    if (passwordInput && passwordInput.parentElement) passwordInput.parentElement.classList.remove('error');
}

function clearRegisterErrors() {
    const errorElements = ['nameError', 'birthDateError', 'cityError', 'registerEmailError', 'registerPasswordError'];
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.remove('show');
    });
    
    const inputElements = ['firstName', 'lastName', 'birthDate', 'city', 'registerEmail', 'registerPassword'];
    inputElements.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.parentElement) element.parentElement.classList.remove('error');
    });
}

function showLoginError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    const inputElement = document.getElementById(field === 'email' ? 'loginEmail' : 'loginPassword');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.classList.add('error');
    }
}

function showEmailSuccess(message) {
    const successElement = document.getElementById('emailSuccess');
    const emailInput = document.getElementById('loginEmail');
    
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
    if (emailInput && emailInput.parentElement) {
        emailInput.parentElement.classList.add('success');
    }
}

function showRegisterError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    let inputId = field;
    if (field === 'name') inputId = 'firstName';
    if (field === 'registerEmail') inputId = 'registerEmail';
    if (field === 'registerPassword') inputId = 'registerPassword';
    
    const inputElement = document.getElementById(inputId);
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.classList.add('error');
    }
}

// ===== VALIDATION FUNCTIONS =====

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) ? age - 1 : age;
    return actualAge >= 18;
}

// ===== FUNCIONES DE UI PARA AUTENTICACIÓN =====

function updateUIForAuthenticatedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser && loginBtn && logoutBtn) {
        loginBtn.textContent = `Hola, ${currentUser.firstName}`;
        logoutBtn.style.display = 'block';
    }
}

function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn && logoutBtn) {
        loginBtn.textContent = 'Login';
        logoutBtn.style.display = 'none';
    }
}

// ===== FORM HANDLING FUNCTIONS =====

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    clearLoginErrors();

    if (passwordSection.style.display === 'none') {
        if (!email) {
            showLoginError('email', 'Email is required');
            return;
        }

        if (!validateEmail(email)) {
            showLoginError('email', 'Please enter a valid email');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';

        try {
            const response = await checkEmailExists(email);

            if (response.exists) {
                showEmailSuccess('Email found! Enter your password');
                passwordSection.style.display = 'block';
                // Add required to the password field when it is shown
                const passwordInput = document.getElementById('loginPassword');
                if (passwordInput) passwordInput.setAttribute('required', 'true');
                submitBtn.textContent = 'Start session';
                passwordInput.focus();
            } else {
                hideLoginModal();
                showRegisterModal();
                // Pre-fill the email in the registration form
                const registerEmailField = document.getElementById('registerEmail');
                if (registerEmailField) {
                    registerEmailField.value = email;
                }
            }
        } catch (error) {
            showLoginError('email', 'Error verifying email. Please try again.');
        } finally {
            submitBtn.disabled = false;
        }
    } else {
        const password = document.getElementById('loginPassword').value;

        if (!password) {
            showLoginError('password', 'Password is required');
            return;
        }

        if (password.length < 8) {
            showLoginError('password', 'Password must have at least 8 characters');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Starting session...';

        try {
            const response = await loginUser(email, password);
            
            if (response.success) {
                saveSession(response.data);
                alert(`Welcome back, ${response.data.firstName}!`);
                hideLoginModal();
                updateUIForAuthenticatedUser();
            } else {
                showLoginError('password', response.message);
            }
        } catch (error) {
            showLoginError('password', 'Error starting session. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        birthDate: document.getElementById('birthDate').value,
        city: document.getElementById('city').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    clearRegisterErrors();

    let hasErrors = false;

    if (!formData.firstName) {
        showRegisterError('name', 'Name is required');
        hasErrors = true;
    }

    if (!formData.lastName) {
        showRegisterError('name', 'Last name is required');
        hasErrors = true;
    }

    if (!formData.birthDate) {
        showRegisterError('birthDate', 'Date of birth is required');
        hasErrors = true;
    } else if (!validateAge(formData.birthDate)) {
        showRegisterError('birthDate', 'You must be at least 18 years old to register');
        hasErrors = true;
    }

    if (!formData.city) {
        showRegisterError('city', 'City is required');
        hasErrors = true;
    }

    if (!formData.email) {
        showRegisterError('registerEmail', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(formData.email)) {
        showRegisterError('registerEmail', 'Please enter a valid email');
        hasErrors = true;
    }

    if (!formData.password) {
        showRegisterError('registerPassword', 'Password is required');
        hasErrors = true;
    } else if (formData.password.length < 8) {
        showRegisterError('registerPassword', 'Password must have at least 8 characters');
        hasErrors = true;
    }

    if (hasErrors) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const response = await registerUser(formData);
        
        if (response.success) {
            saveSession(response.data);
            alert('Registration successful! Welcome to RoomieZ!');
            hideRegisterModal();
            updateUIForAuthenticatedUser();
        } else {
            showRegisterError('registerEmail', response.message);
        }
    } catch (error) {
        alert('Error in registration. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}

// ===== INITIALIZATION OF EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return; // Stop execution if not authenticated
    }
    
    // Load session
    loadSession();
    updateUIForAuthenticatedUser();

    // Event listeners for navigation
    const menuBtn = document.getElementById('menuBtn');
    const loginBtn = document.getElementById('loginBtn');
    const configBtn = document.getElementById('configBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.toggle('active');
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
            if (isAuthenticated) {
                alert(`You are connected as ${currentUser.firstName} ${currentUser.lastName}`);
            } else {
                showLoginModal();
            }
        });
    }

    if (configBtn) {
        configBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
            if (isAuthenticated) {
                redirectTo('../config/config.html', { userId: currentUser.id });
            } else {
                alert('You must login to access the configuration');
                showLoginModal();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
            if (confirm('Are you sure you want to close session?')) {
                clearSession();
                updateUIForLoggedOutUser();
                alert('Session closed successfully');
            }
        });
    }

    // Event listeners for modals
    const closeLoginBtn = document.getElementById('closeLoginModal');
    const closeRegisterBtn = document.getElementById('closeRegisterModal');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (closeLoginBtn) closeLoginBtn.addEventListener('click', hideLoginModal);
    if (closeRegisterBtn) closeRegisterBtn.addEventListener('click', hideRegisterModal);

    if (switchToRegisterBtn) {
        switchToRegisterBtn.addEventListener('click', function() {
            hideLoginModal();
            showRegisterModal();
        });
    }

    if (switchToLoginBtn) {
        switchToLoginBtn.addEventListener('click', function() {
            hideRegisterModal();
            showLoginModal();
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) hideLoginModal();
        });
    }

    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === this) hideRegisterModal();
        });
    }

    // Event listeners for forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!e.target.closest('.menu-btn') && dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    });
});
