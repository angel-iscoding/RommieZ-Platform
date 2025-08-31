// ===== CONFIGURACIÓN DE API =====

const API_CONFIG = {
    BASE_URL: 'http://localhost:3010/api/V1',
    ENDPOINTS: {
        USERS: '/users',
        CHECK_EMAIL: '/users/check-email',
        ROOMZ: '/roomz',
        USER_CONTACTS: '/users/:id/contacts'
    }
};

// Estado global de autenticación
let currentUser = null;
let isAuthenticated = false;

// ===== FUNCIONES DE API =====

// Función auxiliar para manejar respuestas de la API
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
}

// Función para verificar si el email existe
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
            message: data.isRegistered ? 'Email encontrado en la base de datos' : 'Email no encontrado'
        };
    } catch (error) {
        console.error('Error checking email:', error);
        return {
            success: false,
            exists: false,
            message: 'Error al verificar email'
        };
    }
}

// Función para login de usuario
async function loginUser(email, password) {
    try {
        // Primero verificamos que el email existe
        const emailCheck = await checkEmailExists(email);
        
        if (!emailCheck.exists) {
            return {
                success: false,
                message: 'Email no encontrado'
            };
        }

        // Obtener todos los usuarios y validar credenciales
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
                    message: 'Inicio de sesión exitoso'
            };
            } else {
            return {
                    success: false,
                message: 'Contraseña incorrecta'
            };
        }
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            message: 'Error de conexión. Intenta de nuevo.'
        };
    }
}

// Función para registro de usuario
async function registerUser(userData) {
    try {
            // Verificar si el email ya existe
        const emailCheck = await checkEmailExists(userData.email);
            
        if (emailCheck.exists) {
            return {
                    success: false,
                    message: 'Este email ya está registrado'
            };
            }

            // Validar edad (18+)
            const birthDate = new Date(userData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
            
            if (actualAge < 18) {
            return {
                    success: false,
                    message: 'Debes ser mayor de 18 años para registrarte'
            };
            }

        // Crear usuario en la API
            const newUser = {
                first_name: userData.firstName,
                middle_name: userData.middleName || null,
                last_name: userData.lastName,
                username: userData.email.split('@')[0],
                email: userData.email,
            password: userData.password, // En producción debería estar hasheada
            city: userData.city || 'Barranquilla', // Ciudad por defecto
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
                message: 'Registro exitoso'
        };
    } catch (error) {
        console.error('Error during registration:', error);
        return {
            success: false,
            message: error.message || 'Error de conexión. Intenta de nuevo.'
        };
    }
}

// ===== FUNCIONES DE ROOMZ (PUBLICACIONES) =====

// Función para obtener todas las roomz
async function fetchRoomz(filter = 'all') {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMZ}`);
        const data = await handleApiResponse(response);
        
        let roomz = data.roomz || [];
        
        // Transformar datos de la API al formato esperado por el frontend
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
            
            // Aplicar filtros
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
            message: 'Roomz obtenidas exitosamente'
        };
    } catch (error) {
        console.error('Error fetching roomz:', error);
        return {
            success: false,
            data: [],
            message: 'Error al cargar las roomz'
        };
    }
}

// Función para buscar roomz
async function searchRoomz(query) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROOMZ}`);
        const data = await handleApiResponse(response);
        
        let roomz = data.roomz || [];
        
        // Transformar y filtrar por búsqueda
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
            message: `${filteredRoomz.length} resultados encontrados`
        };
    } catch (error) {
        console.error('Error searching roomz:', error);
        return {
            success: false,
            data: [],
            message: 'Error en la búsqueda'
        };
    }
}

// Función para obtener una roomz específica
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
            message: 'Room obtenida exitosamente'
        };
    } catch (error) {
        console.error('Error fetching room:', error);
        return {
            success: false,
            data: null,
            message: 'Error al cargar la room'
        };
    }
}

// ===== FUNCIONES DE SESIÓN =====

// Guardar sesión en localStorage
function saveSession(userData) {
    const sessionData = {
        user: userData,
        userId: userData.id, // Guardar ID específicamente para acceso rápido
        isAuthenticated: true,
        timestamp: Date.now()
    };
    
    localStorage.setItem('roomieZ_session', JSON.stringify(sessionData));
    localStorage.setItem('roomieZ_userId', userData.id.toString()); // ID separado para verificación rápida
    
    currentUser = userData;
    isAuthenticated = true;
}

// Obtener ID del usuario desde localStorage
function getCurrentUserId() {
    const userId = localStorage.getItem('roomieZ_userId');
    return userId ? parseInt(userId) : null;
}

// Verificar si el usuario actual puede acceder a configuración
function canAccessConfig(targetUserId = null) {
    if (!isAuthenticated || !currentUser) {
        return false;
    }
    
    // Si no se especifica targetUserId, verificar acceso general
    if (targetUserId === null) {
        return true;
    }
    
    // Solo puede acceder a su propia configuración
    return currentUser.id === targetUserId;
}

// Cargar sesión desde localStorage
function loadSession() {
    const sessionData = localStorage.getItem('roomieZ_session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        // Verificar que la sesión no sea muy antigua (24 horas)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            currentUser = session.user;
            isAuthenticated = session.isAuthenticated;
            updateUIForAuthenticatedUser();
        } else {
            clearSession();
        }
    }
}

// Limpiar sesión
function clearSession() {
    localStorage.removeItem('roomieZ_session');
    localStorage.removeItem('roomieZ_userId');
    currentUser = null;
    isAuthenticated = false;
    updateUIForLoggedOutUser();
}

// ===== FUNCIONES DE VALIDACIÓN =====

// Validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar edad (18+)
function validateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) ? age - 1 : age;
    return actualAge >= 18;
}

// ===== FUNCIONES DE UI =====

// Función para renderizar publicaciones
function renderPublications(publications) {
    const grid = document.getElementById('publicationsGrid');
    
    if (!grid) return;
    
    if (publications.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>No se encontraron RoomZ</h3>
                <p>Intenta con otros filtros de búsqueda</p>
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

// Función para mostrar estado de carga
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const publicationsGrid = document.getElementById('publicationsGrid');
    
    if (loadingState) loadingState.style.display = 'block';
    if (publicationsGrid) publicationsGrid.style.display = 'none';
}

// Función para ocultar estado de carga
function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    const publicationsGrid = document.getElementById('publicationsGrid');
    
    if (loadingState) loadingState.style.display = 'none';
    if (publicationsGrid) publicationsGrid.style.display = 'grid';
}

// ===== FUNCIONES DE MODALES =====

// Mostrar modal de login
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
    modal.classList.add('active');
    resetLoginForm();
    }
}

// Ocultar modal de login
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
    modal.classList.remove('active');
    resetLoginForm();
    }
}

// Mostrar modal de registro
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
    modal.classList.add('active');
    resetRegisterForm();
    }
}

// Ocultar modal de registro
function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
    modal.classList.remove('active');
    resetRegisterForm();
    }
}

// ===== FUNCIONES DE FORMULARIOS =====

// Reset del formulario de login
function resetLoginForm() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (passwordSection) passwordSection.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Continue';
    clearLoginErrors();
}

// Reset del formulario de registro
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
    if (cityInput) cityInput.value = 'Barranquilla'; // Valor por defecto
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    clearRegisterErrors();
}

// Limpiar errores de login
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

// Limpiar errores de registro
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

// Mostrar error de login
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

// Mostrar éxito de email
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

// Mostrar error de registro
function showRegisterError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    
    if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    }
    
    // Obtener el campo de input correspondiente
    let inputId = field;
    if (field === 'name') inputId = 'firstName';
    if (field === 'registerEmail') inputId = 'registerEmail';
    if (field === 'registerPassword') inputId = 'registerPassword';
    
    const inputElement = document.getElementById(inputId);
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.classList.add('error');
    }
}

// ===== FUNCIONES DE NAVEGACIÓN Y REDIRECCIÓN =====

// Función para redireccionar a páginas
function redirectTo(path, params = {}) {
    let url = path;
    
    // Agregar parámetros como query string
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url += `?${queryString}`;
    }
    
    window.location.href = url;
}

// Función para verificar autenticación antes de acceso
function requireAuth(redirectPath = 'index.html') {
    if (!isAuthenticated || !currentUser) {
        alert('Debes iniciar sesión para acceder a esta funcionalidad');
        redirectTo(redirectPath);
        return false;
    }
    return true;
}

// Manejar click en publicación - FUNCIÓN GLOBAL
window.handlePublicationClick = function(publicationId) {
    console.log(`Click en RoomZ ID: ${publicationId}`);
    // Navegar a detalles sin requerir autenticación previa
    redirectTo('pages/details/details.html', { roomId: publicationId });
};

// Función para navegar a configuración
function navigateToConfig() {
    if (!requireAuth()) {
        return;
    }
    
    redirectTo('pages/config/config.html', { userId: currentUser.id });
}

// Función para obtener parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Función auxiliar para cargar publicaciones - FUNCIÓN GLOBAL  
window.loadPublications = loadPublications;

// ===== FUNCIONES DE UI PARA AUTENTICACIÓN =====

// Actualizar UI para usuario autenticado
function updateUIForAuthenticatedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser && loginBtn && logoutBtn) {
        loginBtn.textContent = `Hola, ${currentUser.firstName}`;
        logoutBtn.style.display = 'block';
    }
}

// Actualizar UI para usuario no autenticado
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn && logoutBtn) {
    loginBtn.textContent = 'Login';
    logoutBtn.style.display = 'none';
    }
}

// ===== EVENT LISTENERS PRINCIPALES =====

document.addEventListener('DOMContentLoaded', async function() {
    // Cargar sesión existente
    loadSession();
    
    // Cargar publicaciones iniciales
    await loadPublications();

    // ===== EVENT LISTENERS DE NAVEGACIÓN =====

    // Botón de inicio
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

    // Opciones del menú
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
        if (isAuthenticated) {
            alert(`Estás conectado como ${currentUser.firstName} ${currentUser.lastName}`);
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
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            clearSession();
            alert('Sesión cerrada exitosamente');
        }
    });
    }

    // ===== EVENT LISTENERS DE BÚSQUEDA Y FILTROS =====

    // Input de filtro/búsqueda
    const filterInput = document.getElementById('filterInput');
    const filterDropdown = document.getElementById('filterDropdown');
    let searchTimeout;
    
    if (filterInput && filterDropdown) {
    filterInput.addEventListener('focus', function() {
        filterDropdown.classList.add('active');
    });

    filterInput.addEventListener('input', async function() {
        const query = this.value.trim();
        
        // Limpiar timeout anterior
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Debounce de búsqueda
        searchTimeout = setTimeout(async () => {
            if (query.length > 2) {
                console.log(`Búsqueda: "${query}"`);
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

    // Opciones de filtro
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

    // ===== EVENT LISTENERS DE MODALES =====

    // Cerrar modales
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

    // Cambiar entre login y registro
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

    // Cerrar modales al hacer click en el overlay
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

    // ===== EVENT LISTENERS DE FORMULARIOS =====

    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    // ===== EVENT LISTENERS DE BOTONES SOCIALES =====

    // Botones de login social (simulados)
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

    // Cerrar dropdowns al hacer click fuera
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

// ===== FUNCIONES DE MANEJO DE FORMULARIOS =====

// Manejar envío del formulario de login
async function handleLoginSubmit(e) {
    e.preventDefault();
    console.log('Login form submitted'); // Debug log
    
    const email = document.getElementById('loginEmail').value.trim();
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    clearLoginErrors();

    // Si la sección de contraseña no está visible, validar email
    if (passwordSection.style.display === 'none') {
        // Validar que el email no esté vacío
        if (!email) {
            showLoginError('email', 'El email es requerido');
            return;
        }

        // Validar formato del email
        if (!validateEmail(email)) {
            showLoginError('email', 'Por favor ingresa un email válido');
            return;
        }

        // Deshabilitar botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';

        try {
            // Verificar si el email existe en la base de datos
            const response = await checkEmailExists(email);
            
            if (response.exists) {
                // Email encontrado, mostrar campo de contraseña
                showEmailSuccess('¡Email encontrado! Ingresa tu contraseña');
                passwordSection.style.display = 'block';
                submitBtn.textContent = 'Sign In';
                document.getElementById('loginPassword').focus();
            } else {
                // Email no encontrado, sugerir registro
                showLoginError('email', 'Email no encontrado. ¿Te gustaría registrarte?');
                setTimeout(() => {
                    hideLoginModal();
                    showRegisterModal();
                }, 2000);
            }
        } catch (error) {
            showLoginError('email', 'Error al verificar el email. Intenta de nuevo.');
        } finally {
            submitBtn.disabled = false;
        }
    } else {
        // Validar contraseña y hacer login
        const password = document.getElementById('loginPassword').value;

        if (!password) {
            showLoginError('password', 'La contraseña es requerida');
            return;
        }

        if (password.length < 8) {
            showLoginError('password', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Deshabilitar botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            const response = await loginUser(email, password);
            
            if (response.success) {
                // Login exitoso
                saveSession(response.data);
                alert(`¡Bienvenido de vuelta, ${response.data.firstName}!`);
                hideLoginModal();
                updateUIForAuthenticatedUser();
            } else {
                showLoginError('password', response.message);
            }
        } catch (error) {
            showLoginError('password', 'Error al iniciar sesión. Intenta de nuevo.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    }
}

// Manejar envío del formulario de registro
async function handleRegisterSubmit(e) {
    e.preventDefault();
    console.log('Register form submitted'); // Debug log
    
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

    // Validación del formulario
    let hasErrors = false;

    // Validar nombres
    if (!formData.firstName) {
        showRegisterError('name', 'El nombre es requerido');
        hasErrors = true;
    }

    if (!formData.lastName) {
        showRegisterError('name', 'El apellido es requerido');
        hasErrors = true;
    }

    // Validar fecha de nacimiento
    if (!formData.birthDate) {
        showRegisterError('birthDate', 'La fecha de nacimiento es requerida');
        hasErrors = true;
    } else if (!validateAge(formData.birthDate)) {
        showRegisterError('birthDate', 'Debes ser mayor de 18 años para registrarte');
        hasErrors = true;
    }

    // Validar ciudad
    if (!formData.city) {
        showRegisterError('city', 'La ciudad es requerida');
        hasErrors = true;
    }

    // Validar email
    if (!formData.email) {
        showRegisterError('registerEmail', 'El email es requerido');
        hasErrors = true;
    } else if (!validateEmail(formData.email)) {
        showRegisterError('registerEmail', 'Por favor ingresa un email válido');
        hasErrors = true;
    }

    // Validar contraseña
    if (!formData.password) {
        showRegisterError('registerPassword', 'La contraseña es requerida');
        hasErrors = true;
    } else if (formData.password.length < 8) {
        showRegisterError('registerPassword', 'La contraseña debe tener al menos 8 caracteres');
        hasErrors = true;
    }

    if (hasErrors) return;

    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta...';

    try {
        const response = await registerUser(formData);
        
        if (response.success) {
            // Registro exitoso
            saveSession(response.data);
            alert('¡Registro exitoso! Bienvenido a RoomieZ!');
            hideRegisterModal();
            updateUIForAuthenticatedUser();
        } else {
            showRegisterError('registerEmail', response.message);
        }
    } catch (error) {
        alert('Error en el registro. Intenta de nuevo.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}

// ===== FUNCIÓN PRINCIPAL DE CARGA =====

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
        console.error('Error cargando publicaciones:', error);
        hideLoading();
        const grid = document.getElementById('publicationsGrid');
        if (grid) {
            grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>Error al cargar las RoomZ</h3>
                <p>${error.message}</p>
                    <button onclick="window.loadPublications()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #49274A; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
        }
    }
}

// ===== UTILIDADES DE CONSOLA PARA TESTING =====

// Exponer funciones para testing en consola
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