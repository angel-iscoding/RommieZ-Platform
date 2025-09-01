// ===== AUTHENTICATION VERIFICATION =====

// Verify authentication when loading the page
document.addEventListener('DOMContentLoaded', function() {
    // Load session from localStorage
    const hasSession = window.RoomZAuth?.loadSession?.() || (getUserIdFromStorage() !== null);
    
    if (!hasSession || !window.RoomZAuth?.isAuthenticated?.()) {
        alert('You must log in to access settings');
        window.location.href = '../../index.html';
        return;
    }
    
    // Verify URL parameters for additional security
    const urlParams = new URLSearchParams(window.location.search);
    const requestedUserId = urlParams.get('userId');
    const currentUserId = window.RoomZAuth?.getCurrentUserId?.() || getUserIdFromStorage();
    
    if (requestedUserId && parseInt(requestedUserId) !== currentUserId) {
        alert('You do not have permission to access this configuration');
        window.location.href = '../../index.html';
        return;
    }
    
    // If we reach here, the user is properly authenticated
    initializeConfig();
});

// API Configuration
const API_BASE_URL = 'http://localhost:3010/api/V1';

// Global state specific to the configuration page
let currentContacts = null;
let userRoomz = [];
let configUserId = null;

// Edit states
let isEditingProfile = false;
let isEditingContacts = false;
let editingRoomzId = null;
let isAddingRoomz = false;

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const errorMessageEl = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// Navigation elements
const sidebarItems = document.querySelectorAll('.sidebar-item');
const sections = document.querySelectorAll('.section');

// Profile elements
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editActionsEl = document.getElementById('editActions');

// Elementos del perfil
const profileImageEl = document.getElementById('profileImage');
const profileImagePlaceholder = document.getElementById('profileImagePlaceholder');
const usernameEl = document.getElementById('username');
const fullNameDisplay = document.getElementById('fullNameDisplay');
const fullNameInput = document.getElementById('fullNameInput');
const cityDisplay = document.getElementById('cityDisplay');
const cityInput = document.getElementById('cityInput');
const emailDisplay = document.getElementById('emailDisplay');
const emailInput = document.getElementById('emailInput');
const birthDateDisplay = document.getElementById('birthDateDisplay');
const birthDateInput = document.getElementById('birthDateInput');
const roleDisplay = document.getElementById('roleDisplay');
const roleInput = document.getElementById('roleInput');

// Contact elements
const editContactsBtn = document.getElementById('editContactsBtn');
const cancelContactsBtn = document.getElementById('cancelContactsBtn');
const saveContactsBtn = document.getElementById('saveContactsBtn');
const editContactsActionsEl = document.getElementById('editContactsActions');

const phoneDisplay = document.getElementById('phoneDisplay');
const phoneInput = document.getElementById('phoneInput');
const whatsappDisplay = document.getElementById('whatsappDisplay');
const whatsappInput = document.getElementById('whatsappInput');
const instagramDisplay = document.getElementById('instagramDisplay');
const instagramInput = document.getElementById('instagramInput');
const facebookDisplay = document.getElementById('facebookDisplay');
const facebookInput = document.getElementById('facebookInput');
const twitterDisplay = document.getElementById('twitterDisplay');
const twitterInput = document.getElementById('twitterInput');
const linkedinDisplay = document.getElementById('linkedinDisplay');
const linkedinInput = document.getElementById('linkedinInput');
const tiktokDisplay = document.getElementById('tiktokDisplay');
const tiktokInput = document.getElementById('tiktokInput');

// RoomZ elements
const addRoomzBtn = document.getElementById('addRoomzBtn');
const roomzGridEl = document.getElementById('roomzGrid');
const roomzModal = document.getElementById('roomzModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelRoomzBtn = document.getElementById('cancelRoomzBtn');
const saveRoomzBtn = document.getElementById('saveRoomzBtn');
const deleteRoomzBtn = document.getElementById('deleteRoomzBtn');
const modalTitle = document.getElementById('modalTitle');

// Formulario de RoomZ
const roomzTitleInput = document.getElementById('roomzTitle');
const roomzSubtitleInput = document.getElementById('roomzSubtitle');
const roomzDetailsInput = document.getElementById('roomzDetails');
const roomzDescriptionInput = document.getElementById('roomzDescription');
const roomzAddressInput = document.getElementById('roomzAddress');
const roomzPriceInput = document.getElementById('roomzPrice');
const roomzTypeInput = document.getElementById('roomzType');
const roomzAvailableInput = document.getElementById('roomzAvailable');

// Configuration initialization function
function initializeConfig() {
    // Get ID of the authenticated user
    configUserId = window.RoomZAuth?.getCurrentUserId?.() || getUserIdFromStorage();
    
    if (!configUserId) {
        showError('User ID not found. Please log in.');
        return;
    }
    
    init();
    setupEventListeners();
}

// Main initialization function
async function init() {
    try {
        showLoading();
        
        // Load user data and contacts in parallel
        const [userResult, contactsResult, roomzResult] = await Promise.all([
            loadUserData(configUserId),
            loadUserContacts(configUserId),
            loadUserRoomz(configUserId)
        ]);
        
        // Update the currentUser of the auth.js with the loaded data
        if (window.RoomZAuth && window.RoomZAuth.currentUser) {
            window.RoomZAuth.currentUser = userResult;
        }
        
        currentContacts = contactsResult;
        userRoomz = roomzResult;
        
        // Hide loading and show content
        hideLoading();
        showContent();
        
        // Render the data
        renderUserProfile();
        renderUserContacts();
        renderUserRoomz();
        
    } catch (error) {
        console.error('💥 Error initializing application:', error);
        showError(`Error loading configuration: ${error.message}`);
    }
}

// Get ID of the user from the URL
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId') || urlParams.get('id');
}

// Get ID of the user from the localStorage
function getUserIdFromStorage() {
    const userId = localStorage.getItem('roomieZ_userId');
    return userId ? parseInt(userId) : null;
}

// ==================== API FUNCTIONS ====================

// Load user data
async function loadUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.data && data.data.id) {
            return data.data;
        } else {
            throw new Error('API did not return valid user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        throw new Error(`Error loading user data: ${error.message}`);
    }
}

// Load user contacts
async function loadUserContacts(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/contacts`);
        
        if (response.status === 404) {
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.data && data.data.id) {
            return data.data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al cargar contactos:', error);
        return null;
    }
}

// Cargar RoomZ del usuario
async function loadUserRoomz(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/roomz/user/${userId}`);
        
        
        if (response.status === 404) {
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Verify that the response has the correct structure.
        if (data && data.roomz && Array.isArray(data.roomz)) {
            return data.roomz;
        } else {
            console.error('❌ Invalid RoomZ response structure:', data);
            
            // Try different possible structures.
            if (data && Array.isArray(data)) {
                return data;
            } else if (data && data.data && Array.isArray(data.data)) {
                return data.data;
            } else if (data && data.results && Array.isArray(data.results)) {
                return data.results;
            } else {
                return [];
            }
        }
    } catch (error) {
        console.error('Error al cargar RoomZ:', error);
        return [];
    }
}

// Actualizar datos del usuario
async function updateUserData(userId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
}

// Actualizar contactos del usuario
async function updateUserContacts(userId, contactsData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactsData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar contactos:', error);
        throw new Error(`Error al actualizar contactos: ${error.message}`);
    }
}

// Crear nuevo RoomZ
async function createRoomz(roomzData) {
    try {
        const response = await fetch(`${API_BASE_URL}/roomz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomzData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al crear RoomZ:', error);
        throw new Error(`Error al crear RoomZ: ${error.message}`);
    }
}

// Actualizar RoomZ existente
async function updateRoomz(roomzId, roomzData) {
    try {
        const response = await fetch(`${API_BASE_URL}/roomz/${roomzId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomzData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar RoomZ:', error);
        throw new Error(`Error al actualizar RoomZ: ${error.message}`);
    }
}

// Eliminar RoomZ
async function deleteRoomz(roomzId) {
    try {
        const response = await fetch(`${API_BASE_URL}/roomz/${roomzId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al eliminar RoomZ:', error);
        throw new Error(`Error al eliminar RoomZ: ${error.message}`);
    }
}

// ==================== FUNCIONES DE RENDERIZADO ====================

// Renderizar perfil del usuario
function renderUserProfile() {
    const currentUser = window.RoomZAuth?.currentUser;
    if (!currentUser) return;
    
    // Username
    usernameEl.textContent = currentUser.username || 'Usuario';
    
    // Nombre completo
    const fullName = `${currentUser.first_name || ''} ${currentUser.middle_name || ''} ${currentUser.last_name || ''}`.trim();
    fullNameDisplay.textContent = fullName || 'Sin nombre';
    fullNameInput.value = fullName;
    
    // Ciudad
    cityDisplay.textContent = currentUser.city || 'Sin especificar';
    cityInput.value = currentUser.city || '';
    
    // Email
    emailDisplay.textContent = currentUser.email || 'Sin email';
    emailInput.value = currentUser.email || '';
    
    // Fecha de nacimiento
    if (currentUser.birthdate) {
        const birthDate = new Date(currentUser.birthdate);
        const formattedDate = birthDate.toLocaleDateString('es-ES');
        birthDateDisplay.textContent = formattedDate;
        birthDateInput.value = currentUser.birthdate.split('T')[0];
    } else {
        birthDateDisplay.textContent = 'Sin especificar';
        birthDateInput.value = '';
    }
    
    // Rol
    const roleText = currentUser.role === 'landlord' ? 'Arrendador' : 'Estudiante';
    roleDisplay.textContent = roleText;
    roleInput.value = currentUser.role || 'student';
}

// Renderizar contactos del usuario
function renderUserContacts() {
    if (!currentContacts) {
        // Mostrar mensaje de que no hay contactos
        phoneDisplay.textContent = 'Sin especificar';
        whatsappDisplay.textContent = 'Sin especificar';
        instagramDisplay.textContent = 'Sin especificar';
        facebookDisplay.textContent = 'Sin especificar';
        twitterDisplay.textContent = 'Sin especificar';
        linkedinDisplay.textContent = 'Sin especificar';
        tiktokDisplay.textContent = 'Sin especificar';
        return;
    }
    
    // Phone
    phoneDisplay.textContent = currentContacts.phone_number || 'Sin especificar';
    phoneInput.value = currentContacts.phone_number || '';
    
    // WhatsApp
    whatsappDisplay.textContent = currentContacts.whatsapp_number || 'Sin especificar';
    whatsappInput.value = currentContacts.whatsapp_number || '';
    
    // Instagram
    instagramDisplay.textContent = currentContacts.instagram_url ? 'Ver perfil' : 'Sin especificar';
    instagramInput.value = currentContacts.instagram_url || '';
    
    // Facebook
    facebookDisplay.textContent = currentContacts.facebook_url ? 'Ver perfil' : 'Sin especificar';
    facebookInput.value = currentContacts.facebook_url || '';
    
    // Twitter
    twitterDisplay.textContent = currentContacts.twitter_url ? 'Ver perfil' : 'Sin especificar';
    twitterInput.value = currentContacts.twitter_url || '';
    
    // LinkedIn
    linkedinDisplay.textContent = currentContacts.linkedin_url ? 'Ver perfil' : 'Sin especificar';
    linkedinInput.value = currentContacts.linkedin_url || '';
    
    // TikTok
    tiktokDisplay.textContent = currentContacts.tiktok_url ? 'Ver perfil' : 'Sin especificar';
    tiktokInput.value = currentContacts.tiktok_url || '';
}

// Renderizar RoomZ del usuario
function renderUserRoomz() {
    if (!roomzGridEl) {
        console.error('❌ Elemento roomzGrid no encontrado en el DOM');
        return;
    }
    
    // Verify that the section is visible
    const roomzSection = document.getElementById('roomz-section');
    if (roomzSection && roomzSection.classList.contains('hidden')) {
        return;
    }
    
    // Limpiar grid
    roomzGridEl.innerHTML = '';
    
    if (!userRoomz || userRoomz.length === 0) {
        roomzGridEl.innerHTML = `
            <div class="no-roomz">
                <p>No tienes RoomZ publicados aún.</p>
                <p>¡Crea tu primera publicación!</p>
            </div>
        `;
        return;
    }
    
    userRoomz.forEach((roomz, index) => {
        const roomzCard = createRoomzCard(roomz);
        roomzGridEl.appendChild(roomzCard);
    });
}

// Crear tarjeta de RoomZ
function createRoomzCard(roomz) {
    const card = document.createElement('div');
    card.className = 'roomz-card';
    
    // Validar y formatear datos
    const title = roomz.title || 'No title';
    const subtitle = roomz.subtitle || 'No subtitle';
    const details = roomz.details || 'No details';
    const description = roomz.description || 'No description';
    const address = roomz.address || 'No address';
    const price = roomz.price ? parseFloat(roomz.price).toLocaleString('es-CO') : '0';
    const typeText = getRoomzTypeText(roomz.roomz_type);
    const availableText = roomz.is_available ? 'Disponible' : 'No disponible';
    const availableClass = roomz.is_available ? 'available' : 'not-available';
    
    card.innerHTML = `
        <div class="roomz-header">
            <h3 class="roomz-title">${title}</h3>
            <span class="roomz-type">${typeText}</span>
        </div>
        <div class="roomz-content">
            <p class="roomz-subtitle">${subtitle}</p>
            <p class="roomz-details">${details}</p>
            <p class="roomz-description">${description}</p>
            <p class="roomz-address">📍 ${address}</p>
            <p class="roomz-price">$${price} COP/mes</p>
            <span class="roomz-status ${availableClass}">${availableText}</span>
        </div>
        <div class="roomz-actions">
            <button class="btn-edit" onclick="editRoomz(${roomz.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
            </button>
            <button class="btn-delete" onclick="deleteRoomzById(${roomz.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
                Eliminar
            </button>
        </div>
    `;
    
    return card;
}

// ==================== EDIT FUNCTIONS ====================

// Toggle profile editing
function toggleProfileEdit() {
    isEditingProfile = !isEditingProfile;
    
    if (isEditingProfile) {
        // Mostrar inputs, ocultar displays
        fullNameDisplay.classList.add('hidden');
        fullNameInput.classList.remove('hidden');
        cityDisplay.classList.add('hidden');
        cityInput.classList.remove('hidden');
        emailDisplay.classList.add('hidden');
        emailInput.classList.remove('hidden');
        birthDateDisplay.classList.add('hidden');
        birthDateInput.classList.remove('hidden');
        roleDisplay.classList.add('hidden');
        roleInput.classList.remove('hidden');
        
        // Show edit actions
        editActionsEl.classList.remove('hidden');
        
        // Change button text
        editProfileBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editando...
        `;
    } else {
        // Mostrar displays, ocultar inputs
        fullNameDisplay.classList.remove('hidden');
        fullNameInput.classList.add('hidden');
        cityDisplay.classList.remove('hidden');
        cityInput.classList.add('hidden');
        emailDisplay.classList.remove('hidden');
        emailInput.classList.add('hidden');
        birthDateDisplay.classList.remove('hidden');
        birthDateInput.classList.add('hidden');
        roleDisplay.classList.remove('hidden');
        roleInput.classList.add('hidden');
        
        // Hide edit actions
        editActionsEl.classList.add('hidden');
        
        // Reset button text
        editProfileBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
        `;
    }
}

// Toggle contact editing
function toggleContactsEdit() {
    isEditingContacts = !isEditingContacts;
    
    if (isEditingContacts) {
        // Mostrar inputs, ocultar displays
        phoneDisplay.classList.add('hidden');
        phoneInput.classList.remove('hidden');
        whatsappDisplay.classList.add('hidden');
        whatsappInput.classList.remove('hidden');
        instagramDisplay.classList.add('hidden');
        instagramInput.classList.remove('hidden');
        facebookDisplay.classList.add('hidden');
        facebookInput.classList.remove('hidden');
        twitterDisplay.classList.add('hidden');
        twitterInput.classList.remove('hidden');
        linkedinDisplay.classList.add('hidden');
        linkedinInput.classList.remove('hidden');
        tiktokDisplay.classList.add('hidden');
        tiktokInput.classList.remove('hidden');
        
        // Show edit actions
        editContactsActionsEl.classList.remove('hidden');
        
        // Change button text
        editContactsBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editando...
        `;
    } else {
        // Mostrar displays, ocultar inputs
        phoneDisplay.classList.remove('hidden');
        phoneInput.classList.add('hidden');
        whatsappDisplay.classList.remove('hidden');
        whatsappInput.classList.add('hidden');
        instagramDisplay.classList.remove('hidden');
        instagramInput.classList.add('hidden');
        facebookDisplay.classList.remove('hidden');
        facebookInput.classList.add('hidden');
        twitterDisplay.classList.remove('hidden');
        twitterInput.classList.add('hidden');
        linkedinDisplay.classList.remove('hidden');
        linkedinInput.classList.add('hidden');
        tiktokDisplay.classList.remove('hidden');
        tiktokInput.classList.add('hidden');
        
        // Hide edit actions
        editContactsActionsEl.classList.add('hidden');
        
        // Reset button text
        editContactsBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
        `;
    }
}

// Guardar perfil
async function saveProfile() {
    try {
        // Obtener datos actualizados de los inputs
        const updatedData = {
            first_name: fullNameInput.value.split(' ')[0] || '',
            middle_name: fullNameInput.value.split(' ').slice(1, -1).join(' ') || null,
            last_name: fullNameInput.value.split(' ').slice(-1)[0] || '',
            city: cityInput.value,
            email: emailInput.value,
            birthdate: birthDateInput.value,
            role: roleInput.value
        };
        
        // Validar campos requeridos
        if (!updatedData.first_name || !updatedData.last_name || !updatedData.city || !updatedData.email || !updatedData.birthdate) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }
        
        // Guardar en la API
        await updateUserData(configUserId, updatedData);
        
        // Actualizar datos locales
        if (window.RoomZAuth && window.RoomZAuth.currentUser) {
            window.RoomZAuth.currentUser = { ...window.RoomZAuth.currentUser, ...updatedData };
        }
        
        // Re-renderizar perfil
        renderUserProfile();
        
        // Exit edit mode
        toggleProfileEdit();
        
        alert('Perfil actualizado exitosamente!');
        
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        alert(`Error al guardar el perfil: ${error.message}`);
    }
}

// Guardar contactos
async function saveContacts() {
    try {
        // Obtener datos actualizados de los inputs
        const updatedContacts = {
            phone_number: phoneInput.value || null,
            whatsapp_number: whatsappInput.value || null,
            instagram_url: instagramInput.value || null,
            facebook_url: facebookInput.value || null,
            twitter_url: twitterInput.value || null,
            linkedin_url: linkedinInput.value || null,
            tiktok_url: tiktokInput.value || null
        };
        
        // Validate that at least one contact method is provided
        const hasContact = Object.values(updatedContacts).some(value => value !== null && value !== '');
        if (!hasContact) {
            alert('You must provide at least one contact method.');
            return;
        }
        
        // Guardar en la API
        await updateUserContacts(configUserId, updatedContacts);
        
        // Actualizar datos locales
        currentContacts = { ...currentContacts, ...updatedContacts };
        
        // Re-renderizar contactos
        renderUserContacts();
        
        // Exit edit mode
        toggleContactsEdit();
        
        alert('Contactos actualizados exitosamente!');
        
    } catch (error) {
        console.error('Error al guardar contactos:', error);
        alert(`Error al guardar los contactos: ${error.message}`);
    }
}

// ==================== FUNCIONES DE ROOMZ ====================

// Mostrar modal de RoomZ
function showRoomzModal(roomz = null) {
    if (roomz) {
        // Editando RoomZ existente
        modalTitle.textContent = 'Editar RoomZ';
        roomzTitleInput.value = roomz.title;
        roomzSubtitleInput.value = roomz.subtitle;
        roomzDetailsInput.value = roomz.details;
        roomzDescriptionInput.value = roomz.description;
        roomzAddressInput.value = roomz.address;
        roomzPriceInput.value = roomz.price;
        roomzTypeInput.value = roomz.roomz_type;
        roomzAvailableInput.value = roomz.is_available ? 'true' : 'false';
        editingRoomzId = roomz.id;
        isAddingRoomz = false;
        
        // Show delete button
        deleteRoomzBtn.classList.remove('hidden');
    } else {
        // Agregando nuevo RoomZ
        modalTitle.textContent = 'Nuevo RoomZ';
        roomzTitleInput.value = '';
        roomzSubtitleInput.value = '';
        roomzDetailsInput.value = '';
        roomzDescriptionInput.value = '';
        roomzAddressInput.value = '';
        roomzPriceInput.value = '';
        roomzTypeInput.value = 'apartment';
        roomzAvailableInput.value = 'true';
        editingRoomzId = null;
        isAddingRoomz = true;
        
        // Hide delete button
        deleteRoomzBtn.classList.add('hidden');
    }
    
    roomzModal.classList.remove('hidden');
}

// Ocultar modal de RoomZ
function hideRoomzModal() {
    roomzModal.classList.add('hidden');
    editingRoomzId = null;
    isAddingRoomz = false;
}

// Editar RoomZ
function editRoomz(roomzId) {
    const roomz = userRoomz.find(r => r.id === roomzId);
    if (roomz) {
        showRoomzModal(roomz);
    }
}

// Guardar RoomZ
async function saveRoomz() {
    try {
        // Obtener datos del formulario
        const roomzData = {
            user_id: parseInt(configUserId),
            title: roomzTitleInput.value,
            subtitle: roomzSubtitleInput.value,
            details: roomzDetailsInput.value,
            description: roomzDescriptionInput.value,
            address: roomzAddressInput.value,
            price: parseFloat(roomzPriceInput.value),
            roomz_type: roomzTypeInput.value,
            is_available: roomzAvailableInput.value === 'true'
        };
        
        // Validar campos requeridos
        if (!roomzData.title || !roomzData.subtitle || !roomzData.details || 
            !roomzData.description || !roomzData.address || !roomzData.price) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }
        
        if (roomzData.price <= 0) {
            alert('El precio debe ser mayor a 0.');
            return;
        }
        
        if (editingRoomzId) {
            // Actualizar RoomZ existente
            await updateRoomz(editingRoomzId, roomzData);
            
            // Actualizar en la lista local
            const index = userRoomz.findIndex(r => r.id === editingRoomzId);
            if (index !== -1) {
                userRoomz[index] = { ...userRoomz[index], ...roomzData };
            }
        } else {
            // Crear nuevo RoomZ
            const result = await createRoomz(roomzData);
            
            // Agregar a la lista local
            const newRoomz = {
                id: result.id,
                ...roomzData
            };
            userRoomz.push(newRoomz);
        }
        
        // Re-renderizar RoomZ
        renderUserRoomz();
        
        // Ocultar modal
        hideRoomzModal();
        
        alert(editingRoomzId ? 'RoomZ actualizado exitosamente!' : 'RoomZ creado exitosamente!');
        
    } catch (error) {
        console.error('Error al guardar RoomZ:', error);
        alert(`Error al guardar el RoomZ: ${error.message}`);
    }
}

// Eliminar RoomZ por ID
async function deleteRoomzById(roomzId) {
            if (!confirm('Are you sure you want to delete this RoomZ? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteRoomz(roomzId);
        
        // Remover de la lista local
        userRoomz = userRoomz.filter(r => r.id !== roomzId);
        
        // Re-renderizar RoomZ
        renderUserRoomz();
        
        alert('RoomZ eliminado exitosamente!');
        
    } catch (error) {
        console.error('Error al eliminar RoomZ:', error);
        alert(`Error al eliminar el RoomZ: ${error.message}`);
    }
}

// ==================== FUNCIONES DE NAVEGACIÓN ====================

// Change active section
function changeSection(sectionName) {
    
    // Ocultar todas las secciones
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
            // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // If it's the roomz section, re-render
        if (sectionName === 'roomz') {
            if (userRoomz && Array.isArray(userRoomz)) {
                renderUserRoomz();
            }
        }
    } else {
        console.error(`❌ No se encontró la sección: ${sectionName}-section`);
    }
    
    // Actualizar sidebar
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ==================== FUNCIONES DE UI ====================

// Mostrar loading
function showLoading() {
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    contentEl.classList.add('hidden');
}

// Ocultar loading
function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Mostrar contenido
function showContent() {
    contentEl.classList.remove('hidden');
}

// Mostrar error
function showError(message) {
    loadingEl.classList.add('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    
    if (errorMessageEl) {
        errorMessageEl.textContent = message;
    }
}

// ==================== FUNCIONES UTILITARIAS ====================

// Obtener texto del tipo de RoomZ
function getRoomzTypeText(type) {
    const types = {
        'studio': 'Estudio',
        'apartment': 'Apartamento',
        'residential_complex': 'Conjunto Residencial'
    };
    
    return types[type] || 'Alojamiento';
}

// ==================== EVENT LISTENERS CONFIGURATION ====================

function setupEventListeners() {
    // Sidebar navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            changeSection(section);
        });
    });
    
    // Botones del perfil
    editProfileBtn.addEventListener('click', toggleProfileEdit);
    cancelEditBtn.addEventListener('click', toggleProfileEdit);
    saveProfileBtn.addEventListener('click', saveProfile);
    
    // Botones de contactos
    editContactsBtn.addEventListener('click', toggleContactsEdit);
    cancelContactsBtn.addEventListener('click', toggleContactsEdit);
    saveContactsBtn.addEventListener('click', saveContacts);
    
    // Botones de RoomZ
    addRoomzBtn.addEventListener('click', () => showRoomzModal());
    closeModalBtn.addEventListener('click', hideRoomzModal);
    cancelRoomzBtn.addEventListener('click', hideRoomzModal);
    saveRoomzBtn.addEventListener('click', saveRoomz);
    deleteRoomzBtn.addEventListener('click', () => {
        if (editingRoomzId) {
            deleteRoomzById(editingRoomzId);
            hideRoomzModal();
        }
    });
    
    // Retry button
    retryBtn.addEventListener('click', init);
    
    // Cerrar modal al hacer clic fuera
    roomzModal.addEventListener('click', (e) => {
        if (e.target === roomzModal) {
            hideRoomzModal();
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !roomzModal.classList.contains('hidden')) {
            hideRoomzModal();
        }
    });
}

// ==================== FUNCIONES DE NAVEGACIÓN ====================

// Ir al index
function goToIndex() {
    window.location.href = '../../index.html';
}

// Logout
function logout() {
            if (confirm('Are you sure you want to log out?')) {
        // Clear session using auth.js if available
        if (window.RoomZAuth && window.RoomZAuth.clearSession) {
            window.RoomZAuth.clearSession();
        } else {
            // Fallback: limpiar localStorage directamente
            localStorage.removeItem('roomieZ_userId');
            localStorage.removeItem('roomieZ_isAuthenticated');
        }
        
        // Redirigir al index
        window.location.href = '../../index.html';
    }
}