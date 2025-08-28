// Mock data and state management
let userData = null;
let pensionsData = [];
let isEditingProfile = false;
let editingPensionId = null;
let isAddingPension = false;

// Mock functions to simulate API calls
function mockGetUserData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
                username: 'User name',
                fullName: 'Luisángel Ávila Afanador',
                email: 'angel.iscoding@gmail.com',
                city: 'Atlántico / Barranquilla',
                birthDate: '2005-06-07'
            });
        }, 800);
    });
}

function mockGetPensionsData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    title: 'Title of the departament',
                    price: '$999,000 by month',
                    rating: 4.97,
                    image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800'
                },
                {
                    id: 2,
                    title: 'Title of the departament',
                    price: '$999,000 by month',
                    rating: 4.97,
                    image: 'https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=800'
                }
            ]);
        }, 500);
    });
}

function mockSaveUserData(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Saving user data:', data);
            resolve(data);
        }, 300);
    });
}

function mockSavePensionData(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Saving pension data:', data);
            resolve(data);
        }, 300);
    });
}

// DOM elements
const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('content');
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editActionsEl = document.getElementById('editActions');
const addPensionBtn = document.getElementById('addPensionBtn');
const pensionsGridEl = document.getElementById('pensionsGrid');
const pensionModal = document.getElementById('pensionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelPensionBtn = document.getElementById('cancelPensionBtn');
const savePensionBtn = document.getElementById('savePensionBtn');
const modalTitle = document.getElementById('modalTitle');

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

// Pension form elements
const pensionTitleInput = document.getElementById('pensionTitle');
const pensionPriceInput = document.getElementById('pensionPrice');
const pensionImageInput = document.getElementById('pensionImage');

// Initialize the application
async function init() {
    try {
        // Load user data and pensions in parallel
        const [userDataResult, pensionsResult] = await Promise.all([
            mockGetUserData(),
            mockGetPensionsData()
        ]);
        
        userData = userDataResult;
        pensionsData = pensionsResult;
        
        // Hide loading and show content
        loadingEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        
        // Render the data
        renderUserProfile();
        renderPensions();
        
    } catch (error) {
        console.error('Error loading data:', error);
        // In a real app, you'd show an error message
    }
}

// Render user profile
function renderUserProfile() {
    if (!userData) return;
    
    // Set profile image
    if (userData.profileImage) {
        profileImageEl.src = userData.profileImage;
        profileImageEl.style.display = 'block';
        profileImagePlaceholder.style.display = 'none';
    } else {
        profileImageEl.style.display = 'none';
        profileImagePlaceholder.style.display = 'flex';
    }
    
    // Set username
    usernameEl.textContent = userData.username;
    
    // Set profile information
    fullNameDisplay.textContent = userData.fullName;
    fullNameInput.value = userData.fullName;
    
    cityDisplay.textContent = userData.city;
    cityInput.value = userData.city;
    
    emailDisplay.textContent = userData.email;
    emailInput.value = userData.email;
    
    // Format birth date for display
    const birthDate = new Date(userData.birthDate);
    const formattedDate = birthDate.toLocaleDateString('es-ES');
    birthDateDisplay.textContent = formattedDate;
    birthDateInput.value = userData.birthDate;
}

// Render pensions
function renderPensions() {
    pensionsGridEl.innerHTML = '';
    
    pensionsData.forEach(pension => {
        const pensionCard = createPensionCard(pension);
        pensionsGridEl.appendChild(pensionCard);
    });
}

// Create pension card element
function createPensionCard(pension) {
    const card = document.createElement('div');
    card.className = 'pension-card';
    card.innerHTML = `
        <div style="position: relative;">
            <img src="${pension.image}" alt="${pension.title}" class="pension-image">
            <button class="pension-edit-btn" onclick="editPension(${pension.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
        </div>
        <div class="pension-content">
            <h3 class="pension-title">${pension.title}</h3>
            <p class="pension-price">${pension.price}</p>
            <div class="pension-rating">
                <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                </svg>
                <span>${pension.rating}</span>
            </div>
        </div>
    `;
    return card;
}

// Profile editing functions
function toggleProfileEdit() {
    isEditingProfile = !isEditingProfile;
    
    if (isEditingProfile) {
        // Show inputs, hide displays
        fullNameDisplay.classList.add('hidden');
        fullNameInput.classList.remove('hidden');
        cityDisplay.classList.add('hidden');
        cityInput.classList.remove('hidden');
        emailDisplay.classList.add('hidden');
        emailInput.classList.remove('hidden');
        birthDateDisplay.classList.add('hidden');
        birthDateInput.classList.remove('hidden');
        
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

async function saveProfile() {
    // Get updated data from inputs
    const updatedData = {
        ...userData,
        fullName: fullNameInput.value,
        city: cityInput.value,
        email: emailInput.value,
        birthDate: birthDateInput.value
    };
    
    try {
        // Save to "database"
        await mockSaveUserData(updatedData);
        
        // Update local data
        userData = updatedData;
        
        // Re-render profile
        renderUserProfile();
        
        // Exit edit mode
        toggleProfileEdit();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error al guardar el perfil. Inténtalo de nuevo.');
    }
}

// Pension management functions
function showPensionModal(pension = null) {
    if (pension) {
        // Editing existing pension
        modalTitle.textContent = 'Editar Pensión';
        pensionTitleInput.value = pension.title;
        pensionPriceInput.value = pension.price;
        pensionImageInput.value = pension.image;
        editingPensionId = pension.id;
        isAddingPension = false;
    } else {
        // Adding new pension
        modalTitle.textContent = 'Nueva Pensión';
        pensionTitleInput.value = '';
        pensionPriceInput.value = '';
        pensionImageInput.value = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';
        editingPensionId = null;
        isAddingPension = true;
    }
    
    pensionModal.classList.remove('hidden');
}

function hidePensionModal() {
    pensionModal.classList.add('hidden');
    editingPensionId = null;
    isAddingPension = false;
}

function editPension(pensionId) {
    const pension = pensionsData.find(p => p.id === pensionId);
    if (pension) {
        showPensionModal(pension);
    }
}

async function savePension() {
    const pensionData = {
        title: pensionTitleInput.value || 'Nueva Pensión',
        price: pensionPriceInput.value || '$0',
        image: pensionImageInput.value || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
        rating: 5.0
    };
    
    try {
        await mockSavePensionData(pensionData);
        
        if (editingPensionId) {
            // Update existing pension
            const index = pensionsData.findIndex(p => p.id === editingPensionId);
            if (index !== -1) {
                pensionsData[index] = { ...pensionsData[index], ...pensionData };
            }
        } else {
            // Add new pension
            const newPension = {
                id: Date.now(),
                ...pensionData
            };
            pensionsData.push(newPension);
        }
        
        // Re-render pensions
        renderPensions();
        
        // Hide modal
        hidePensionModal();
        
    } catch (error) {
        console.error('Error saving pension:', error);
        alert('Error al guardar la pensión. Inténtalo de nuevo.');
    }
}

// Event listeners
editProfileBtn.addEventListener('click', toggleProfileEdit);
cancelEditBtn.addEventListener('click', toggleProfileEdit);
saveProfileBtn.addEventListener('click', saveProfile);

addPensionBtn.addEventListener('click', () => showPensionModal());
closeModalBtn.addEventListener('click', hidePensionModal);
cancelPensionBtn.addEventListener('click', hidePensionModal);
savePensionBtn.addEventListener('click', savePension);

// Close modal when clicking outside
pensionModal.addEventListener('click', (e) => {
    if (e.target === pensionModal) {
        hidePensionModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !pensionModal.classList.contains('hidden')) {
        hidePensionModal();
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);