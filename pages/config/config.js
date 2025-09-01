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

// Profile elements
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

// RoomZ form
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
        console.error('Error loading contacts:', error);
        return null;
    }
}

// Load RoomZ of the user
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
        console.error('Error loading RoomZ:', error);
        return [];
    }
}

// Update user data
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
        console.error('Error updating user data:', error);
        throw new Error(`Error updating user data: ${error.message}`);
    }
}

// Update user contacts
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
        console.error('Error updating contacts:', error);
        throw new Error(`Error updating contacts: ${error.message}`);
    }
}

// Create new RoomZ
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
        console.error('Error creating RoomZ:', error);
        throw new Error(`Error creating RoomZ: ${error.message}`);
    }
}

// Update existing RoomZ
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
        console.error('Error updating RoomZ:', error);
        throw new Error(`Error updating RoomZ: ${error.message}`);
    }
}

// Delete RoomZ
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
        console.error('Error deleting RoomZ:', error);
        throw new Error(`Error deleting RoomZ: ${error.message}`);
    }
}

// ==================== RENDER FUNCTIONS ====================

// Render user profile
function renderUserProfile() {
    const currentUser = window.RoomZAuth?.currentUser;
    if (!currentUser) return;
    
    // Username
    usernameEl.textContent = currentUser.username || 'User';
    
    // Full name
    const fullName = `${currentUser.first_name || ''} ${currentUser.middle_name || ''} ${currentUser.last_name || ''}`.trim();
    fullNameDisplay.textContent = fullName || 'No name';
    fullNameInput.value = fullName;
    
    // City
    cityDisplay.textContent = currentUser.city || 'No specified';
    cityInput.value = currentUser.city || '';
    
    // Email
    emailDisplay.textContent = currentUser.email || 'No email';
    emailInput.value = currentUser.email || '';
    
    // Birth date
    if (currentUser.birthdate) {
        const birthDate = new Date(currentUser.birthdate);
        const formattedDate = birthDate.toLocaleDateString('es-ES');
        birthDateDisplay.textContent = formattedDate;
        birthDateInput.value = currentUser.birthdate.split('T')[0];
    } else {
        birthDateDisplay.textContent = 'No specified';
        birthDateInput.value = '';
    }
    
    // Rol
    const roleText = currentUser.role === 'landlord' ? 'Landlord' : 'Student';
    roleDisplay.textContent = roleText;
    roleInput.value = currentUser.role || 'student';
}

// Render user contacts
function renderUserContacts() {
    if (!currentContacts) {
        // Show message that there are no contacts
        phoneDisplay.textContent = 'No specified';
        whatsappDisplay.textContent = 'No specified';
        instagramDisplay.textContent = 'No specified';
        facebookDisplay.textContent = 'No specified';
        twitterDisplay.textContent = 'No specified';
        linkedinDisplay.textContent = 'No specified';
        tiktokDisplay.textContent = 'No specified';
        return;
    }
    
    // Phone
    phoneDisplay.textContent = currentContacts.phone_number || 'No specified';
    phoneInput.value = currentContacts.phone_number || '';
    
    // WhatsApp
    whatsappDisplay.textContent = currentContacts.whatsapp_number || 'No specified';
    whatsappInput.value = currentContacts.whatsapp_number || '';
    
    // Instagram
    instagramDisplay.textContent = currentContacts.instagram_url ? 'Show profile' : 'No specified';
    instagramInput.value = currentContacts.instagram_url || '';
    
    // Facebook
    facebookDisplay.textContent = currentContacts.facebook_url ? 'Show profile' : 'No specified';
    facebookInput.value = currentContacts.facebook_url || '';
    
    // Twitter
    twitterDisplay.textContent = currentContacts.twitter_url ? 'Show profile' : 'No specified';
    twitterInput.value = currentContacts.twitter_url || '';
    
    // LinkedIn
    linkedinDisplay.textContent = currentContacts.linkedin_url ? 'Show profile' : 'No specified';
    linkedinInput.value = currentContacts.linkedin_url || '';
    
    // TikTok
    tiktokDisplay.textContent = currentContacts.tiktok_url ? 'Show profile' : 'No specified';
    tiktokInput.value = currentContacts.tiktok_url || '';
}

// Render RoomZ of the user
function renderUserRoomz() {
    if (!roomzGridEl) {
        console.error('❌ Element roomzGrid not found in the DOM');
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
                <p>You have no RoomZ published yet.</p>
                <p>Create your first publication!</p>
            </div>
        `;
        return;
    }
    
    userRoomz.forEach((roomz, index) => {
        const roomzCard = createRoomzCard(roomz);
        roomzGridEl.appendChild(roomzCard);
    });
}

// Create RoomZ card
function createRoomzCard(roomz) {
    const card = document.createElement('div');
    card.className = 'roomz-card';
    
    // Validate and format data
    const title = roomz.title || 'No title';
    const subtitle = roomz.subtitle || 'No subtitle';
    const details = roomz.details || 'No details';
    const description = roomz.description || 'No description';
    const address = roomz.address || 'No address';
    const price = roomz.price ? parseFloat(roomz.price).toLocaleString('es-CO') : '0';
    const typeText = getRoomzTypeText(roomz.roomz_type);
    const availableText = roomz.is_available ? 'Available' : 'Not available';
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
                Edit
            </button>
            <button class="btn-delete" onclick="deleteRoomzById(${roomz.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
                Delete
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
        // Show displays, hide inputs
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
            Edit
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
            Editing...
        `;
    } else {
        // Show displays, hide inputs
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
            Edit
        `;
    }
}

// Save profile
async function saveProfile() {
    try {
        // Get updated data from inputs
        const updatedData = {
            first_name: fullNameInput.value.split(' ')[0] || '',
            middle_name: fullNameInput.value.split(' ').slice(1, -1).join(' ') || null,
            last_name: fullNameInput.value.split(' ').slice(-1)[0] || '',
            city: cityInput.value,
            email: emailInput.value,
            birthdate: birthDateInput.value,
            role: roleInput.value
        };
        
        // Validate required fields
        if (!updatedData.first_name || !updatedData.last_name || !updatedData.city || !updatedData.email || !updatedData.birthdate) {
            alert('Please complete all required fields.');
            return;
        }
        
        // Save in the API
        await updateUserData(configUserId, updatedData);
        
        // Update local data
        if (window.RoomZAuth && window.RoomZAuth.currentUser) {
            window.RoomZAuth.currentUser = { ...window.RoomZAuth.currentUser, ...updatedData };
        }
        
        // Re-render profile
        renderUserProfile();
        
        // Exit edit mode
        toggleProfileEdit();
        
        alert('Profile updated successfully!');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert(`Error saving the profile: ${error.message}`);
    }
}

// Save contacts
async function saveContacts() {
    try {
        // Get updated data from inputs
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
        
            // Save in the API
        await updateUserContacts(configUserId, updatedContacts);
        
        // Update local data
        currentContacts = { ...currentContacts, ...updatedContacts };
        
        // Re-render contacts
        renderUserContacts();
        
        // Exit edit mode
        toggleContactsEdit();
        
        alert('Contacts updated successfully!');
        
    } catch (error) {
        console.error('Error saving contacts:', error);
        alert(`Error saving the contacts: ${error.message}`);
    }
}

// ==================== ROOMZ FUNCTIONS ====================

// Show RoomZ modal
function showRoomzModal(roomz = null) {
    if (roomz) {
        // Editing existing RoomZ
        modalTitle.textContent = 'Edit RoomZ';
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
        // Adding new RoomZ
        modalTitle.textContent = 'New RoomZ';
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

// Hide RoomZ modal
function hideRoomzModal() {
    roomzModal.classList.add('hidden');
    editingRoomzId = null;
    isAddingRoomz = false;
}

// Edit RoomZ
function editRoomz(roomzId) {
    const roomz = userRoomz.find(r => r.id === roomzId);
    if (roomz) {
        showRoomzModal(roomz);
    }
}

// Save RoomZ
async function saveRoomz() {
    try {
        // Get data from form
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
        
        // Validate required fields
        if (!roomzData.title || !roomzData.subtitle || !roomzData.details || 
            !roomzData.description || !roomzData.address || !roomzData.price) {
            alert('Please complete all required fields.');
            return;
        }
        
        if (roomzData.price <= 0) {
            alert('The price must be greater than 0.');
            return;
        }
        
        if (editingRoomzId) {
            // Update existing RoomZ
            await updateRoomz(editingRoomzId, roomzData);
            
            // Update local list
            const index = userRoomz.findIndex(r => r.id === editingRoomzId);
            if (index !== -1) {
                userRoomz[index] = { ...userRoomz[index], ...roomzData };
            }
        } else {
            // Create new RoomZ
            const result = await createRoomz(roomzData);
            
            // Add to local list
            const newRoomz = {
                id: result.id,
                ...roomzData
            };
            userRoomz.push(newRoomz);
        }
        
        // Re-render RoomZ
        renderUserRoomz();
        
        // Hide modal
        hideRoomzModal();
        
        alert(editingRoomzId ? 'RoomZ updated successfully!' : 'RoomZ created successfully!');
        
    } catch (error) {
        console.error('Error saving RoomZ:', error);
        alert(`Error saving the RoomZ: ${error.message}`);
    }
}

// Delete RoomZ by ID
async function deleteRoomzById(roomzId) {
            if (!confirm('Are you sure you want to delete this RoomZ? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteRoomz(roomzId);
        
        // Remove from local list
        userRoomz = userRoomz.filter(r => r.id !== roomzId);
        
        // Re-render RoomZ
        renderUserRoomz();
        
        alert('RoomZ deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting RoomZ:', error);
        alert(`Error deleting the RoomZ: ${error.message}`);
    }
}

// ==================== NAVIGATION FUNCTIONS ====================

// Change active section
function changeSection(sectionName) {
    
    // Hide all sections
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
        console.error(`❌ Section not found: ${sectionName}-section`);
    }
    
    // Update sidebar
    sidebarItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ==================== UI FUNCTIONS ====================

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

// Show content
function showContent() {
    contentEl.classList.remove('hidden');
}

// Show error
function showError(message) {
    loadingEl.classList.add('hidden');
    contentEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    
    if (errorMessageEl) {
        errorMessageEl.textContent = message;
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Obtener texto del tipo de RoomZ
function getRoomzTypeText(type) {
    const types = {
        'studio': 'Studio',
        'apartment': 'Apartment',
        'residential_complex': 'Residential Complex'
    };
    
    return types[type] || 'Accommodation';
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
    
    // Profile buttons
    editProfileBtn.addEventListener('click', toggleProfileEdit);
    cancelEditBtn.addEventListener('click', toggleProfileEdit);
    saveProfileBtn.addEventListener('click', saveProfile);
    
    // Contacts buttons
    editContactsBtn.addEventListener('click', toggleContactsEdit);
    cancelContactsBtn.addEventListener('click', toggleContactsEdit);
    saveContactsBtn.addEventListener('click', saveContacts);
    
    // RoomZ buttons
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
    
    // Close modal when clicking outside
    roomzModal.addEventListener('click', (e) => {
        if (e.target === roomzModal) {
            hideRoomzModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !roomzModal.classList.contains('hidden')) {
            hideRoomzModal();
        }
    });
}

// ==================== NAVIGATION FUNCTIONS ====================

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
            // Fallback: clear localStorage directly
            localStorage.removeItem('roomieZ_userId');
            localStorage.removeItem('roomieZ_isAuthenticated');
        }
        
        // Redirect to index
        window.location.href = '../../index.html';
    }
}