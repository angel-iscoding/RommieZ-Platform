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

// Clear session and redirect to home
function clearSession() {
    localStorage.removeItem('roomieZ_session');
    localStorage.removeItem('roomieZ_userId');
    localStorage.removeItem('pending_publication_id');
    currentUser = null;
    isAuthenticated = false;
    updateUIForLoggedOutUser();
    
    // Redirect to home after logout
    window.location.href = '../../index.html';
}

// ===== MODAL UI FUNCTIONS =====
// Login modals removed - not needed in details page

// ===== FORM FUNCTIONS =====

// Login form functions removed - not needed in details page

// ===== VALIDATION FUNCTIONS =====
// Login validation functions removed - not needed in details page

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
// Login form handling functions removed - not needed in details page

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

    // Login button removed - not needed in details page

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
                // clearSession will redirect to home automatically
            }
        });
    }

    // Login modals and forms removed - not needed in details page

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!e.target.closest('.menu-btn') && dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    });
});
