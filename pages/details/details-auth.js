// ===== EXTENSIÓN DE AUTENTICACIÓN PARA DETAILS =====

// ===== FUNCIONES DE AUTENTICACIÓN COMPARTIDAS =====

// Replicar funciones necesarias del index.js
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

async function loginUser(email, password) {
    try {
        const emailCheck = await checkEmailExists(email);
        
        if (!emailCheck.exists) {
            return {
                success: false,
                message: 'Email no encontrado'
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

async function registerUser(userData) {
    try {
        const emailCheck = await checkEmailExists(userData.email);
        
        if (emailCheck.exists) {
            return {
                success: false,
                message: 'Este email ya está registrado'
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
                message: 'Debes ser mayor de 18 años para registrarte'
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

// Guardar sesión en localStorage (extendida para details)
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
    
    // Actualizar UI después de login
    updateUIForAuthenticatedUser();
}

// ===== FUNCIONES DE UI DE MODALES =====

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

// ===== FUNCIONES DE FORMULARIOS =====

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
    if (cityInput) cityInput.value = 'Barranquilla';
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

// ===== FUNCIONES DE VALIDACIÓN =====

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

// ===== MANEJO DE FORMULARIOS =====

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const passwordSection = document.getElementById('passwordSection');
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    clearLoginErrors();

    if (passwordSection.style.display === 'none') {
        if (!email) {
            showLoginError('email', 'El email es requerido');
            return;
        }

        if (!validateEmail(email)) {
            showLoginError('email', 'Por favor ingresa un email válido');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';

        try {
            const response = await checkEmailExists(email);
            
            if (response.exists) {
                showEmailSuccess('¡Email encontrado! Ingresa tu contraseña');
                passwordSection.style.display = 'block';
                submitBtn.textContent = 'Sign In';
                document.getElementById('loginPassword').focus();
            } else {
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
        const password = document.getElementById('loginPassword').value;

        if (!password) {
            showLoginError('password', 'La contraseña es requerida');
            return;
        }

        if (password.length < 8) {
            showLoginError('password', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            const response = await loginUser(email, password);
            
            if (response.success) {
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
        showRegisterError('name', 'El nombre es requerido');
        hasErrors = true;
    }

    if (!formData.lastName) {
        showRegisterError('name', 'El apellido es requerido');
        hasErrors = true;
    }

    if (!formData.birthDate) {
        showRegisterError('birthDate', 'La fecha de nacimiento es requerida');
        hasErrors = true;
    } else if (!validateAge(formData.birthDate)) {
        showRegisterError('birthDate', 'Debes ser mayor de 18 años para registrarte');
        hasErrors = true;
    }

    if (!formData.city) {
        showRegisterError('city', 'La ciudad es requerida');
        hasErrors = true;
    }

    if (!formData.email) {
        showRegisterError('registerEmail', 'El email es requerido');
        hasErrors = true;
    } else if (!validateEmail(formData.email)) {
        showRegisterError('registerEmail', 'Por favor ingresa un email válido');
        hasErrors = true;
    }

    if (!formData.password) {
        showRegisterError('registerPassword', 'La contraseña es requerida');
        hasErrors = true;
    } else if (formData.password.length < 8) {
        showRegisterError('registerPassword', 'La contraseña debe tener al menos 8 caracteres');
        hasErrors = true;
    }

    if (hasErrors) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta...';

    try {
        const response = await registerUser(formData);
        
        if (response.success) {
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

// ===== INICIALIZACIÓN DE EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    // Cargar sesión
    loadSession();
    updateUIForAuthenticatedUser();

    // Event listeners de navegación
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
            if (isAuthenticated) {
                redirectTo('../config/config.html', { userId: currentUser.id });
            } else {
                alert('Debes iniciar sesión para acceder a la configuración');
                showLoginModal();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) dropdown.classList.remove('active');
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                clearSession();
                updateUIForLoggedOutUser();
                alert('Sesión cerrada exitosamente');
            }
        });
    }

    // Event listeners de modales
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

    // Event listeners de formularios
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function(e) {
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!e.target.closest('.menu-btn') && dropdownMenu) {
            dropdownMenu.classList.remove('active');
        }
    });
});
