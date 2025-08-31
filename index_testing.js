// ===== MOCK DATA Y FUNCIONES DE AUTENTICACIÓN =====

// Simulación de la base de datos desde el JSON
const mockDatabase = {
    "users": [
        {
            "id": 1,
            "first_name": "John",
            "middle_name": "Michael",
            "last_name": "Doe", 
            "username": "johndoe",
            "email": "john.doe@email.com",
            "password": "hashedpass123",
            "role": "student",
            "created_at": "2025-08-28T10:00:00.000Z"
        },
        {
            "id": 2,
            "first_name": "Anna",
            "middle_name": null,
            "last_name": "Smith",
            "username": "annasmith", 
            "email": "anna.smith@email.com",
            "password": "hashedpass456",
            "role": "landlord",
            "created_at": "2025-08-28T10:00:00.000Z"
        },
        {
            "id": 3,
            "first_name": "Carlos",
            "middle_name": "Andres",
            "last_name": "Lopez",
            "username": "carloslopez",
            "email": "carlos.lopez@email.com", 
            "password": "hashedpass789",
            "role": "student",
            "created_at": "2025-08-28T10:00:00.000Z"
        }
    ],
    "publications": [
        {
            "id": 1,
            "user_id": 2,
            "title": "Room near University",
            "description": "A cozy room close to campus with internet and utilities included.",
            "address": "123 Main St, City",
            "price": 350.0,
            "is_available": true,
            "published_at": "2025-08-28T10:00:00.000Z"
        },
        {
            "id": 2,
            "user_id": 2,
            "title": "Shared apartment",
            "description": "One bed available in a shared apartment, utilities included.",
            "address": "456 College Ave, City",
            "price": 250.0,
            "is_available": true,
            "published_at": "2025-08-28T10:00:00.000Z"
        },
        {
            "id": 3,
            "user_id": 2,
            "title": "Studio apartment downtown",
            "description": "Modern studio in city center, fully furnished with all amenities.",
            "address": "789 Downtown Blvd, City",
            "price": 450.0,
            "is_available": true,
            "published_at": "2025-08-28T10:00:00.000Z"
        }
    ]
};

// Estado global de autenticación
let currentUser = null;
let isAuthenticated = false;

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Mock function para verificar si el email existe
async function mockCheckEmailExists(email) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockDatabase.users.find(u => u.email === email);
            resolve({
                success: true,
                exists: !!user,
                message: user ? 'Email encontrado en la base de datos' : 'Email no encontrado'
            });
        }, 800);
    });
}

// Mock function para login
async function mockLoginUser(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockDatabase.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                resolve({
                    success: true,
                    data: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role
                    },
                    message: 'Inicio de sesión exitoso'
                });
            } else {
                resolve({
                    success: false,
                    message: 'Email o contraseña incorrectos'
                });
            }
        }, 1000);
    });
}

// Mock function para registro
async function mockRegisterUser(userData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Verificar si el email ya existe
            const existingUser = mockDatabase.users.find(u => u.email === userData.email);
            
            if (existingUser) {
                resolve({
                    success: false,
                    message: 'Este email ya está registrado'
                });
                return;
            }

            // Validar edad (18+)
            const birthDate = new Date(userData.birthDate);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
            
            if (actualAge < 18) {
                resolve({
                    success: false,
                    message: 'Debes ser mayor de 18 años para registrarte'
                });
                return;
            }

            // Crear nuevo usuario
            const newUserId = mockDatabase.users.length + 1;
            const newUser = {
                id: newUserId,
                first_name: userData.firstName,
                middle_name: userData.middleName || null,
                last_name: userData.lastName,
                username: userData.email.split('@')[0],
                email: userData.email,
                password: userData.password,
                role: "student",
                created_at: new Date().toISOString()
            };

            // Agregar a la base de datos mock
            mockDatabase.users.push(newUser);

            resolve({
                success: true,
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
                    role: newUser.role
                },
                message: 'Registro exitoso'
            });
        }, 1200);
    });
}

// ===== FUNCIONES DE PUBLICACIONES =====

// Mock function para obtener publicaciones
async function mockFetchPublications(filter = 'all') {
    return new Promise((resolve) => {
        setTimeout(() => {
            let publications = [...mockDatabase.publications];
            
            // Aplicar filtros
            switch(filter) {
                case 'available':
                    publications = publications.filter(pub => pub.is_available);
                    break;
                case 'price-low':
                    publications.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    publications.sort((a, b) => b.price - a.price);
                    break;
            }
            
            resolve({
                success: true,
                data: publications,
                message: 'Publicaciones obtenidas exitosamente'
            });
        }, 1000);
    });
}

// Mock function para buscar publicaciones
async function mockSearchPublications(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const filteredPublications = mockDatabase.publications.filter(pub => 
                pub.title.toLowerCase().includes(query.toLowerCase()) ||
                pub.description.toLowerCase().includes(query.toLowerCase()) ||
                pub.address.toLowerCase().includes(query.toLowerCase()) ||
                pub.price.toString().includes(query)
            );
            
            resolve({
                success: true,
                data: filteredPublications,
                message: `${filteredPublications.length} resultados encontrados`
            });
        }, 800);
    });
}

// ===== FUNCIONES DE SESIÓN =====

// Guardar sesión en localStorage
function saveSession(userData) {
    localStorage.setItem('roomieZ_session', JSON.stringify({
        user: userData,
        isAuthenticated: true,
        timestamp: Date.now()
    }));
    currentUser = userData;
    isAuthenticated = true;
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
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('publicationsGrid').style.display = 'none';
}

// Función para ocultar estado de carga
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('publicationsGrid').style.display = 'grid';
}

// ===== FUNCIONES DE MODALES =====

// Mostrar modal de login
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    resetLoginForm();
}

// Ocultar modal de login
function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    resetLoginForm();
}

// Mostrar modal de registro
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.add('active');
    resetRegisterForm();
}

// Ocultar modal de registro
function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.remove('active');
    resetRegisterForm();
}

// ===== FUNCIONES DE FORMULARIOS =====

// Reset del formulario de login
function resetLoginForm() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('passwordSection').style.display = 'none';
    document.getElementById('loginSubmitBtn').textContent = 'Continue';
    clearLoginErrors();
}

// Reset del formulario de registro
function resetRegisterForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('birthDate').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    clearRegisterErrors();
}

// Limpiar errores de login
function clearLoginErrors() {
    document.getElementById('emailError').classList.remove('show');
    document.getElementById('emailSuccess').classList.remove('show');
    document.getElementById('passwordError').classList.remove('show');
    document.querySelector('#loginEmail').parentElement.classList.remove('error', 'success');
    document.querySelector('#loginPassword').parentElement.classList.remove('error');
}

// Limpiar errores de registro
function clearRegisterErrors() {
    const errorElements = ['nameError', 'birthDateError', 'registerEmailError', 'registerPasswordError'];
    errorElements.forEach(id => {
        document.getElementById(id).classList.remove('show');
    });
    
    const inputElements = ['firstName', 'lastName', 'birthDate', 'registerEmail', 'registerPassword'];
    inputElements.forEach(id => {
        document.getElementById(id).parentElement.classList.remove('error');
    });
}

// Mostrar error de login
function showLoginError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    document.getElementById(field === 'email' ? 'loginEmail' : 'loginPassword').parentElement.classList.add('error');
}

// Mostrar éxito de email
function showEmailSuccess(message) {
    const successElement = document.getElementById('emailSuccess');
    successElement.textContent = message;
    successElement.classList.add('show');
    document.getElementById('loginEmail').parentElement.classList.add('success');
}

// Mostrar error de registro
function showRegisterError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // Obtener el campo de input correspondiente
    let inputId = field;
    if (field === 'name') inputId = 'firstName';
    if (field === 'registerEmail') inputId = 'registerEmail';
    if (field === 'registerPassword') inputId = 'registerPassword';
    
    document.getElementById(inputId).parentElement.classList.add('error');
}

// ===== FUNCIONES DE NAVEGACIÓN (GLOBALES) =====

// Manejar click en publicación - FUNCIÓN GLOBAL
window.handlePublicationClick = function(publicationId) {
    if (!isAuthenticated) {
        console.log('Usuario no autenticado, mostrando modal de login');
        showLoginModal();
        return;
    }
    
    console.log(`Navegando a publicación ${publicationId}`);
    alert(`Navegando al detalle de la RoomZ ID: ${publicationId}\n\n(En una aplicación real, esto abriría la página de detalles)`);
};

// Función auxiliar para cargar publicaciones - FUNCIÓN GLOBAL  
window.loadPublications = loadPublications;

// ===== FUNCIONES DE UI PARA AUTENTICACIÓN =====

// Actualizar UI para usuario autenticado
function updateUIForAuthenticatedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser) {
        loginBtn.textContent = `Hola, ${currentUser.firstName}`;
        logoutBtn.style.display = 'block';
    }
}

// Actualizar UI para usuario no autenticado
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    loginBtn.textContent = 'Login';
    logoutBtn.style.display = 'none';
}

// ===== EVENT LISTENERS PRINCIPALES =====

document.addEventListener('DOMContentLoaded', async function() {
    // Cargar sesión existente
    loadSession();
    
    // Cargar publicaciones iniciales
    await loadPublications();

    // ===== EVENT LISTENERS DE NAVEGACIÓN =====

    // Botón de inicio
    document.getElementById('RoomZBtn').addEventListener('click', async function() {
        await loadPublications();
    });

    // Menu dropdown
    document.getElementById('menuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('dropdownMenu');
        dropdown.classList.toggle('active');
    });

    // Opciones del menú
    document.getElementById('loginBtn').addEventListener('click', function() {
        document.getElementById('dropdownMenu').classList.remove('active');
        if (isAuthenticated) {
            alert(`Estás conectado como ${currentUser.firstName} ${currentUser.lastName}`);
        } else {
            showLoginModal();
        }
    });

    document.getElementById('configBtn').addEventListener('click', function() {
        document.getElementById('dropdownMenu').classList.remove('active');
        alert('Mock: Abriendo configuración');
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        document.getElementById('dropdownMenu').classList.remove('active');
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            clearSession();
            alert('Sesión cerrada exitosamente');
        }
    });

    // ===== EVENT LISTENERS DE BÚSQUEDA Y FILTROS =====

    // Input de filtro/búsqueda
    const filterInput = document.getElementById('filterInput');
    const filterDropdown = document.getElementById('filterDropdown');
    let searchTimeout;
    
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
                const response = await mockSearchPublications(query);
                hideLoading();
                renderPublications(response.data);
            } else if (query.length === 0) {
                await loadPublications();
            }
        }, 500);
    });

    // Opciones de filtro
    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', async function() {
            const filter = this.dataset.filter;
            
            filterDropdown.classList.remove('active');
            filterInput.value = this.textContent;
            
            showLoading();
            const response = await mockFetchPublications(filter);
            hideLoading();
            renderPublications(response.data);
        });
    });

    // ===== EVENT LISTENERS DE MODALES =====

    // Cerrar modales
    document.getElementById('closeLoginModal').addEventListener('click', hideLoginModal);
    document.getElementById('closeRegisterModal').addEventListener('click', hideRegisterModal);

    // Cambiar entre login y registro
    document.getElementById('switchToRegister').addEventListener('click', function() {
        hideLoginModal();
        showRegisterModal();
    });

    document.getElementById('switchToLogin').addEventListener('click', function() {
        hideRegisterModal();
        showLoginModal();
    });

    // Cerrar modales al hacer click en el overlay
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideLoginModal();
        }
    });

    document.getElementById('registerModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideRegisterModal();
        }
    });

    // ===== EVENT LISTENERS DE FORMULARIOS =====

    // Formulario de login
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);

    // Formulario de registro
    document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);

    // ===== EVENT LISTENERS DE BOTONES SOCIALES =====

    // Botones de login social (simulados)
    document.getElementById('googleLoginBtn').addEventListener('click', function() {
        alert('Mock: Continuar con Google - Funcionalidad no implementada');
    });

    document.getElementById('appleLoginBtn').addEventListener('click', function() {
        alert('Mock: Continuar con Apple - Funcionalidad no implementada');
    });

    document.getElementById('emailLoginBtn').addEventListener('click', function() {
        alert('Mock: Continuar con Email - Funcionalidad no implementada');
    });

    document.getElementById('facebookLoginBtn').addEventListener('click', function() {
        alert('Mock: Continuar con Facebook - Funcionalidad no implementada');
    });

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-filter')) {
            document.getElementById('filterDropdown').classList.remove('active');
        }
        if (!e.target.closest('.menu-btn')) {
            document.getElementById('dropdownMenu').classList.remove('active');
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
            const response = await mockCheckEmailExists(email);
            
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
            const response = await mockLoginUser(email, password);
            
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
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value
    };
    
    const submitBtn = document.getElementById('registerSubmitBtn');
    
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
        const response = await mockRegisterUser(formData);
        
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
        submitBtn.textContent = 'Continue and Accept';
    }
}

// ===== FUNCIÓN PRINCIPAL DE CARGA =====

async function loadPublications(filter = 'all') {
    try {
        showLoading();
        
        const response = await mockFetchPublications(filter);
        
        if (response.success) {
            hideLoading();
            renderPublications(response.data);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('Error cargando publicaciones:', error);
        hideLoading();
        document.getElementById('publicationsGrid').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <h3>Error al cargar las RoomZ</h3>
                <p>${error.message}</p>
                <button onclick="loadPublications()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #49274A; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// ===== UTILIDADES DE CONSOLA PARA TESTING =====

// Exponer funciones para testing en consola
window.RoomZAuth = {
    login: mockLoginUser,
    register: mockRegisterUser,
    checkEmail: mockCheckEmailExists,
    currentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated,
    logout: clearSession,
    database: mockDatabase
};

window.RoomZMocks = {
    fetchPublications: mockFetchPublications,
    searchPublications: mockSearchPublications,
    database: mockDatabase
};