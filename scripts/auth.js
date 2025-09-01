// ===== ARCHIVO COMPARTIDO DE AUTENTICACIÓN =====

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

// ===== FUNCIONES DE SESIÓN =====

// Cargar sesión desde localStorage
function loadSession() {
    const sessionData = localStorage.getItem('roomieZ_session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        // Verificar que la sesión no sea muy antigua (24 horas)
        if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            currentUser = session.user;
            isAuthenticated = session.isAuthenticated;
            return true;
        } else {
            clearSession();
            return false;
        }
    }
    return false;
}

// Limpiar sesión
function clearSession() {
    localStorage.removeItem('roomieZ_session');
    localStorage.removeItem('roomieZ_userId');
    currentUser = null;
    isAuthenticated = false;
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
function requireAuth(redirectPath = '../../index.html') {
    if (!isAuthenticated || !currentUser) {
        alert('Debes iniciar sesión para acceder a esta funcionalidad');
        redirectTo(redirectPath);
        return false;
    }
    return true;
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

// Función para ir al index
function goToIndex() {
    redirectTo('../../index.html');
}

// Función para ir a login
function goToLogin() {
    redirectTo('../../index.html');
}

// ===== FUNCIONES DE API =====

// Función auxiliar para manejar respuestas de la API
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
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

// Función para obtener información de un usuario
async function getUserById(id) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`);
        const data = await handleApiResponse(response);
        
        const user = data.data;
        
        return {
            success: true,
            data: {
                id: user.id,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                username: user.username,
                email: user.email,
                city: user.city,
                birthdate: user.birthdate,
                role: user.role,
                created_at: user.created_at
            },
            message: 'Usuario obtenido exitosamente'
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return {
            success: false,
            data: null,
            message: 'Error al cargar el usuario'
        };
    }
}

// Función para obtener contactos de un usuario
async function getUserContacts(id) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${id}/contacts`);
        const data = await handleApiResponse(response);
        
        return {
            success: true,
            data: data.data,
            message: 'Contactos obtenidos exitosamente'
        };
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return {
            success: false,
            data: null,
            message: 'Error al cargar los contactos'
        };
    }
}

// ===== INICIALIZACIÓN =====

// Cargar sesión automáticamente al cargar el script
document.addEventListener('DOMContentLoaded', function() {
    loadSession();
});

// ===== EXPONER FUNCIONES GLOBALMENTE =====

window.RoomZAuth = {
    loadSession,
    clearSession,
    getCurrentUserId,
    canAccessConfig,
    requireAuth,
    currentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated
};

window.RoomZAPI = {
    getRoomById,
    getUserById,
    getUserContacts,
    handleApiResponse
};

window.RoomZUtils = {
    redirectTo,
    getUrlParams,
    goToIndex,
    goToLogin
};
