// ===== API CONFIGURATION =====

const API_CONFIG = {
    BASE_URL: 'https://roomiez-api-701884280877.europe-west1.run.app/api/V1',
    ENDPOINTS: {
        USERS: '/users',
        CHECK_EMAIL: '/users/check-email',
        ROOMZ: '/roomz',
        USER_CONTACTS: '/users/:id/contacts'
    }
};

// Global authentication state
let currentUser = null;
let isAuthenticated = false;

// ===== API FUNCTIONS =====

// Helper function to handle API responses
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
}

// Function to check if email exists
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

// Function for user login
async function loginUser(email, password) {
    try {
        // verify that the email exists
        const emailCheck = await checkEmailExists(email);
        
        if (!emailCheck.exists) {
            return {
                success: false,
                message: 'Email not found'
            };
        }

        // Get all users and validate credentials
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

// Function for register user
async function registerUser(userData) {
    try {
            // verify that the email already exists
        const emailCheck = await checkEmailExists(userData.email);
            
        if (emailCheck.exists) {
            return {
                    success: false,
                    message: 'This email is already registered'
            };
            }

            // validate age (18+)
            const birthDate = new Date(userData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
            
            if (actualAge < 18) {
            return {
                    success: false,
                    message: 'You must be 18 years or older to register'
            };
            }

        // Create user in the API
            const newUser = {
                first_name: userData.firstName,
                middle_name: userData.middleName || null,
                last_name: userData.lastName,
                username: userData.email.split('@')[0],
                email: userData.email,
            password: userData.password, // In production it should be hashed
            city: userData.city || 'Barranquilla', // Default city
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

// ===== ROOMZ FUNCTIONS (PUBLICATIONS) =====

// Function for obtener todas las roomz
async function fetchRoomz(filter = 'all') {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMZ}`);
        const data = await handleApiResponse(response);
        
        let roomz = data.roomz || [];
        
        // Transform data from the API to the expected format by the frontend
        roomz = roomz.map(room => ({
            id: room.id,
            user_id: room.user_id,
            title: room.title,
            subtitle: room.subtitle,
            details: room.details,
            description: room.description,
            address: room.address,
            price: parseFloat(room.price),
            roomz_type: room.roomz_type,
            is_available: room.is_available === 1 || room.is_available === true,
            published_at: room.published_at
        }));
            
            // Apply filters
            switch(filter) {
                case 'available':
                roomz = roomz.filter(room => room.is_available);
                    break;
                case 'price-low':
                roomz.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                roomz.sort((a, b) => b.price - a.price);
                    break;
            }
            
        return {
                success: true,
            data: roomz,
            message: 'Roomz obtained successfully'
        };
    } catch (error) {
        console.error('Error fetching roomz:', error);
        return {
            success: false,
            data: [],
            message: 'Error loading the roomz'
        };
    }
}

// Function for search roomz
async function searchRoomz(query) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMZ}`);
        const data = await handleApiResponse(response);
        
        let roomz = data.roomz || [];
        
        // Transform and filter by search
        const filteredRoomz = roomz
            .map(room => ({
                id: room.id,
                user_id: room.user_id,
                title: room.title,
                subtitle: room.subtitle,
                details: room.details,
                description: room.description,
                address: room.address,
                price: parseFloat(room.price),
                roomz_type: room.roomz_type,
                is_available: room.is_available === 1 || room.is_available === true,
                published_at: room.published_at
            }))
            .filter(room => 
                room.title.toLowerCase().includes(query.toLowerCase()) ||
                room.description.toLowerCase().includes(query.toLowerCase()) ||
                room.address.toLowerCase().includes(query.toLowerCase()) ||
                room.subtitle.toLowerCase().includes(query.toLowerCase()) ||
                room.details.toLowerCase().includes(query.toLowerCase()) ||
                room.price.toString().includes(query)
            );
        
        return {
                success: true,
            data: filteredRoomz,
            message: `${filteredRoomz.length} results found`
        };
    } catch (error) {
        console.error('Error searching roomz:', error);
        return {
            success: false,
            data: [],
            message: 'Error in the search'
        };
    }
}

// Function for get a specific room
async function getRoomById(id) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMZ}/${id}`);
        const data = await handleApiResponse(response);
        
        const room = data.room;
        
        return {
            success: true,
            data: {
                id: room.id,
                user_id: room.user_id,
                title: room.title,
                subtitle: room.subtitle,
                details: room.details,
                description: room.description,
                address: room.address,
                price: parseFloat(room.price),
                roomz_type: room.roomz_type,
                is_available: room.is_available === 1 || room.is_available === true,
                published_at: room.published_at
            },
            message: 'Room obtained successfully'
        };
    } catch (error) {
        console.error('Error fetching room:', error);
        return {
            success: false,
            data: null,
                message: 'Error loading the room'
        };
    }
}

// ===== SESSION FUNCTIONS =====

// Save session in localStorage
function saveSession(userData) {
    const sessionData = {
        user: userData,
        userId: userData.id, // Save ID specifically for quick access
        isAuthenticated: true,
        timestamp: Date.now()
    };
    
    localStorage.setItem('roomieZ_session', JSON.stringify(sessionData));
    localStorage.setItem('roomieZ_userId', userData.id.toString()); // ID separated for quick verification
    
    currentUser = userData;
    isAuthenticated = true;
}

// Get user ID from localStorage
function getCurrentUserId() {
    const userId = localStorage.getItem('roomieZ_userId');
    return userId ? parseInt(userId) : null;
}

// Verify if the current user can access configuration
function canAccessConfig(targetUserId = null) {
    if (!isAuthenticated || !currentUser) {
        return false;
    }
    
    // If targetUserId is not specified, verify general access
    if (targetUserId === null) {
        return true;
    }
    
    // Only can access its own configuration
    return currentUser.id === targetUserId;
}

// Load session from localStorage
function loadSession() {
    const sessionData = localStorage.getItem('roomieZ_session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        // Verify that the session is not too old (24 hours)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            currentUser = session.user;
            isAuthenticated = session.isAuthenticated;
            updateUIForAuthenticatedUser();
        } else {
            clearSession();
        }
    }
}

// Clear session
function clearSession() {
    localStorage.removeItem('roomieZ_session');
    localStorage.removeItem('roomieZ_userId');
    currentUser = null;
    isAuthenticated = false;
    updateUIForLoggedOutUser();
}

    // ===== VALIDATION FUNCTIONS =====

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate age (18+)
function validateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) ? age - 1 : age;
    return actualAge >= 18;
}

// ===== UI FUNCTIONS =====

// Function for render publications
function renderPublications(publications) {
    const grid = document.getElementById('publicationsGrid');
    
    if (!grid) return;
    
    if (publications.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>No RoomZ found</h3>
                <p>Try with other search filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = publications.map(pub => `
        <div class="publication-card fade-in" data-id="${pub.id}" onclick="handlePublicationClick(${pub.id})">
            <div class="card-image">
                <svg class="camera-icon" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64L19.43 12.53z"/>
                </svg>
            </div>
            <div class="card-content">
                <div class="card-availability ${pub.is_available ? '' : 'unavailable'}">
                    ${pub.is_available ? 'Disponible' : 'No disponible'}
                </div>
                <h3 class="card-title">${pub.title}</h3>
                <p class="card-description">${pub.description}</p>
                <div class="card-address">
                    <svg class="location-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    ${pub.address}
                </div>
                <div class="card-price">$${pub.price.toLocaleString()} COP</div>
            </div>
        </div>
    `).join('');
}

// Function for show loading state
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const publicationsGrid = document.getElementById('publicationsGrid');
    
    if (loadingState) loadingState.style.display = 'block';
    if (publicationsGrid) publicationsGrid.style.display = 'none';
}

// Function for hide loading state
function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    const publicationsGrid = document.getElementById('publicationsGrid');
    
    if (loadingState) loadingState.style.display = 'none';
    if (publicationsGrid) publicationsGrid.style.display = 'grid';
}

// ===== MODAL FUNCTIONS =====

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
    modal.classList.add('active');
    resetLoginForm();
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
    modal.classList.remove('active');
    resetLoginForm();
    }
}

// Show register modal
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
    modal.classList.add('active');
    resetRegisterForm();
    }
}

// Hide register modal
function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
    modal.classList.remove('active');
    resetRegisterForm();
    }
}

// ===== FORM FUNCTIONS =====

// Reset login form
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

// Reset register form
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
    if (cityInput) cityInput.value = 'Barranquilla'; // Default city
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    clearRegisterErrors();
}

// Clear login errors
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

// Clear register errors
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

// Show login error
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

// Show email success
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

// Show register error
function showRegisterError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    
    if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    }
    
    // Get the corresponding input field
    let inputId = field;
    if (field === 'name') inputId = 'firstName';
    if (field === 'registerEmail') inputId = 'registerEmail';
    if (field === 'registerPassword') inputId = 'registerPassword';
    
    const inputElement = document.getElementById(inputId);
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.classList.add('error');
    }
}

// ===== NAVIGATION AND REDIRECTION FUNCTIONS =====

// Function for redirect to pages
function redirectTo(path, params = {}) {
    let url = path;
    
    // Add parameters as query string
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
    }
    
    window.location.href = url;
}

    // Function for verify authentication before access
function requireAuth(redirectPath = 'index.html') {
    if (!isAuthenticated || !currentUser) {
        alert('You must log in to access this functionality');
        redirectTo(redirectPath);
        return false;
    }
    return true;
}

// Handle click on publication - GLOBAL FUNCTION
window.handlePublicationClick = function(publicationId) {
    // Navigate to details without requiring previous authentication
    redirectTo('pages/details/details.html', { id: publicationId });
};

// Function for navigate to configuration
function navigateToConfig() {
    if (!requireAuth()) {
        return;
    }
    
    redirectTo('pages/config/config.html', { userId: currentUser.id });
}

// Function for get parameters from the URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Auxiliary function to load publications - GLOBAL FUNCTION  
window.loadPublications = loadPublications;

// ===== UI FUNCTIONS FOR AUTHENTICATION =====

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser && loginBtn && logoutBtn) {
        loginBtn.textContent = `Hola, ${currentUser.firstName}`;
        logoutBtn.style.display = 'block';
    }
}

// Update UI for unauthenticated user
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn && logoutBtn && !isAuthenticated) {
    loginBtn.textContent = 'Login';
    logoutBtn.style.display = 'none';
    }
}

// ===== EVENT LISTENERS PRINCIPALES =====

document.addEventListener('DOMContentLoaded', async function() {
    // Load existing session
    loadSession();
    
    // Load initial publications
    await loadPublications();

    // ===== EVENT LISTENERS FOR NAVIGATION =====

    // Start button
    const roomZBtn = document.getElementById('RoomZBtn');
    const menuBtn = document.getElementById('menuBtn');
    const loginBtn = document.getElementById('loginBtn');
    const configBtn = document.getElementById('configBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (roomZBtn) {
        roomZBtn.addEventListener('click', async function() {
        await loadPublications();
    });
    }

    // Menu dropdown
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.toggle('active');
    });
    }

    // Menu options
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
            navigateToConfig();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
            if (confirm('Are you sure you want to close session?')) {
            clearSession();
            alert('Session closed successfully');
        }
    });
    }

    // ===== EVENT LISTENERS FOR SEARCH AND FILTERS =====

    // Input for filter/search
    const filterInput = document.getElementById('filterInput');
    const filterDropdown = document.getElementById('filterDropdown');
    let searchTimeout;
    
    if (filterInput && filterDropdown) {
    filterInput.addEventListener('focus', function() {
        filterDropdown.classList.add('active');
    });

    filterInput.addEventListener('input', async function() {
        const query = this.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Debounce search
        searchTimeout = setTimeout(async () => {
            if (query.length > 2) {
                showLoading();
                const response = await searchRoomz(query);
                hideLoading();
                renderPublications(response.data);
            } else if (query.length === 0) {
                await loadPublications();
            }
        }, 500);
    });
    }

    // Filter options
    const filterOptions = document.querySelectorAll('.filter-option');
    if (filterOptions.length > 0 && filterInput && filterDropdown) {
        filterOptions.forEach(option => {
        option.addEventListener('click', async function() {
            const filter = this.dataset.filter;
            
            filterDropdown.classList.remove('active');
            filterInput.value = this.textContent;
            
            showLoading();
            const response = await fetchRoomz(filter);
            hideLoading();
            renderPublications(response.data);
        });
    });
    }

    // ===== EVENT LISTENERS FOR MODALS =====

    // Close modals
    const closeLoginBtn = document.getElementById('closeLoginModal');
    const closeRegisterBtn = document.getElementById('closeRegisterModal');
    const switchToRegisterBtn = document.getElementById('switchToRegister');
    const switchToLoginBtn = document.getElementById('switchToLogin');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', hideLoginModal);
    }

    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', hideRegisterModal);
    }

    // Change between login and register
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

    // Back button in the register modal
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            hideRegisterModal();
            showLoginModal();
        });
    }

    // City selector
    const citySelect = document.getElementById('citySelect');
    const cityInput = document.getElementById('city');
    if (citySelect && cityInput) {
        citySelect.addEventListener('change', function() {
            if (this.value) {
                cityInput.value = this.value;
            }
        });
    }

        // Close modals when clicking on the overlay
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideLoginModal();
        }
    });
    }

    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
        if (e.target === this) {
            hideRegisterModal();
        }
    });
    }

    // ===== EVENT LISTENERS FOR FORMULARIES =====

    // Login form
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    // ===== EVENT LISTENERS FOR SOCIAL BUTTONS =====

    // Social login buttons (mocked)
    const googleBtn = document.getElementById('googleLoginBtn');
    const appleBtn = document.getElementById('appleLoginBtn');
    const emailBtn = document.getElementById('emailLoginBtn');
    const facebookBtn = document.getElementById('facebookLoginBtn');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
        alert('Mock: Continuar con Google - Funcionalidad no implementada');
    });
    }

    if (appleBtn) {
        appleBtn.addEventListener('click', function() {
        alert('Mock: Continuar con Apple - Funcionalidad no implementada');
    });
    }

    if (emailBtn) {
        emailBtn.addEventListener('click', function() {
        alert('Mock: Continuar con Email - Funcionalidad no implementada');
    });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
        alert('Mock: Continuar con Facebook - Funcionalidad no implementada');
    });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const filterDropdown = document.getElementById('filterDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!e.target.closest('.search-filter') && filterDropdown) {
            filterDropdown.classList.remove('active');
        }
        if (!e.target.closest('.menu-btn') && dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    });
});

// ===== FORM HANDLING FUNCTIONS =====

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    clearLoginErrors();

    // If the password section is not visible, validate email
    if (passwordSection.style.display === 'none') {
        // Validate that the email is not empty
        if (!email) {
            showLoginError('email', 'Email is required');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            showLoginError('email', 'Please, send a valid email');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';

        try {
            // Verify if the email exists in the database
            const response = await checkEmailExists(email);
            
            if (response.exists) {
                // Email found, show password field
                showEmailSuccess('¡Email encontrado! Ingresa tu contraseña');
                passwordSection.style.display = 'block';
                // Add required to the password field when it is shown
                const passwordInput = document.getElementById('loginPassword');
                submitBtn.textContent = 'Start session';
                passwordInput.focus();
            } else {
                // Email not found, open register modal with email pre-filled
                    hideLoginModal();
                    showRegisterModal();
                // Pre-fill the email in the register form
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
        // Validate password and login
        const password = document.getElementById('loginPassword').value;

        const response = await checkEmailExists(email);

        if (!response.exists) {
             // Email not found, open register modal with email pre-filled
                hideLoginModal();
                showRegisterModal();
            // Pre-fill the email in the register form
            const registerEmailField = document.getElementById('registerEmail');
            if (registerEmailField) {
                registerEmailField.value = email;
            }
        }



        if (!password) {
            showLoginError('password', 'The password is required');
            return;
        }

        if (password.length < 8) {
            showLoginError('password', 'The password must have at least 8 characters');
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Starting session...';

        try {
            const response = await loginUser(email, password);
            
            if (response.success) {
                // Login successful
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

// Handle register form submission
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        middle_name: "",
        lastName: document.getElementById('lastName').value.trim(),
        birthDate: document.getElementById('birthDate').value,
        city: document.getElementById('city').value.trim() || document.getElementById('citySelect').value,
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: "student"
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    clearRegisterErrors();

    // Validation of the form
    let hasErrors = false;

    // Validate names
    if (!formData.firstName) {
        showRegisterError('name', 'The first name is required');
        hasErrors = true;
    }

    if (!formData.lastName) {
        showRegisterError('name', 'The last name is required');
        hasErrors = true;
    }

    // Validate birth date
    if (!formData.birthDate) {
        showRegisterError('birthDate', 'The birth date is required');
        hasErrors = true;
    } else if (!validateAge(formData.birthDate)) {
        showRegisterError('birthDate', 'You must be at least 18 years old to register');
        hasErrors = true;
    }

    // Validate city
    if (!formData.city) {
        showRegisterError('city', 'The city is required');
        hasErrors = true;
    }

    // Validate email
    if (!formData.email) {
        showRegisterError('registerEmail', 'The email is required');
        hasErrors = true;
    } else if (!validateEmail(formData.email)) {
        showRegisterError('registerEmail', 'Please enter a valid email');
        hasErrors = true;
    }

    // Validate password
    if (!formData.password) {
        showRegisterError('registerPassword', 'The password is required');
        hasErrors = true;
    } else if (formData.password.length < 8) {
        showRegisterError('registerPassword', 'The password must have at least 8 characters');
        hasErrors = true;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
        showRegisterError('registerPassword', 'You must confirm your password');
        hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
        showRegisterError('registerPassword', 'The passwords do not match');
        hasErrors = true;
    }

    if (hasErrors) return;

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        console.log(formData)
        const response = await registerUser(formData);
        
        if (response.success) {
            // Registration successful
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

// ===== MAIN LOAD FUNCTION =====

async function loadPublications(filter = 'all') {
    try {
        showLoading();
        
        const response = await fetchRoomz(filter);
        
        if (response.success) {
            hideLoading();
            renderPublications(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Error loading publications:', error);
        hideLoading();
        const grid = document.getElementById('publicationsGrid');
        if (grid) {
            grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>Error loading the RoomZ</h3>
                <p>${error.message}</p>
                    <button onclick="window.loadPublications()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #49274A; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Try again
                </button>
            </div>
        `;
        }
    }
}

// ===== CONSOLE UTILITIES FOR TESTING =====

// Expose functions for testing in console
window.RoomZAuth = {
    login: loginUser,
    register: registerUser,
    checkEmail: checkEmailExists,
    currentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated,
    logout: clearSession,
    getCurrentUserId: getCurrentUserId,
    canAccessConfig: canAccessConfig
};

window.RoomZAPI = {
    fetchRoomz: fetchRoomz,
    searchRoomz: searchRoomz,
    getRoomById: getRoomById,
    redirectTo: redirectTo,
    getUrlParams: getUrlParams
};

updateUIForLoggedOutUser();