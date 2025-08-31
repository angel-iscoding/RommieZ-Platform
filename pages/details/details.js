// Configuración de la API
const API_BASE_URL = 'http://localhost:3010/api/V1';

// Estado global de la aplicación
let currentRoomz = null;
let currentHost = null;
let currentContacts = null;
let guestCount = 1;

// Elementos del DOM
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const mainContentElement = document.getElementById('main-content');
const errorMessageElement = document.getElementById('error-message');

// Elementos del Roomz
const roomzTitleElement = document.getElementById('roomz-title');
const roomzSubtitleElement = document.getElementById('roomz-subtitle');
const roomzDetailsElement = document.getElementById('roomz-details');
const roomzDescriptionElement = document.getElementById('roomz-description');
const roomzPriceElement = document.getElementById('roomz-price');
const priceBreakdownTextElement = document.getElementById('price-breakdown-text');
const priceBreakdownTotalElement = document.getElementById('price-breakdown-total');
const priceTotalElement = document.getElementById('price-total');

// Elementos del anfitrión
const hostNameElement = document.getElementById('host-name');
const hostExperienceElement = document.getElementById('host-experience');

// Elementos de contacto
const contactLinksElement = document.getElementById('contact-links');

// Elementos de reserva
const checkinElement = document.getElementById('checkin');
const checkoutElement = document.getElementById('checkout');
const guestDisplayElement = document.getElementById('guest-display');
const guestCountElement = document.getElementById('guest-count');
const guestDropdownElement = document.getElementById('guest-dropdown');
const decreaseBtnElement = document.getElementById('decrease-btn');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Función de debug para mostrar toda la información cargada
function debugLoadedData() {
    console.log('🔍 === DEBUG: INFORMACIÓN CARGADA ===');
    
    if (currentRoomz) {
        console.log('🏠 Roomz:', {
            id: currentRoomz.id,
            title: currentRoomz.title,
            subtitle: currentRoomz.subtitle,
            details: currentRoomz.details,
            description: currentRoomz.description,
            address: currentRoomz.address,
            price: currentRoomz.price,
            roomz_type: currentRoomz.roomz_type,
            is_available: currentRoomz.is_available,
            published_at: currentRoomz.published_at,
            user_id: currentRoomz.user_id
        });
    } else {
        console.log('❌ No hay datos del Roomz cargados');
    }
    
    if (currentHost) {
        console.log('👤 Anfitrión:', {
            id: currentHost.id,
            first_name: currentHost.first_name,
            middle_name: currentHost.middle_name,
            last_name: currentHost.last_name,
            username: currentHost.username,
            email: currentHost.email,
            city: currentHost.city,
            role: currentHost.role,
            birthdate: currentHost.birthdate,
            created_at: currentHost.created_at
        });
    } else {
        console.log('❌ No hay datos del anfitrión cargados');
    }
    
    if (currentContacts) {
        console.log('📞 Contactos:', {
            whatsapp_number: currentContacts.whatsapp_number,
            instagram_url: currentContacts.instagram_url,
            facebook_url: currentContacts.facebook_url,
            twitter_url: currentContacts.twitter_url,
            linkedin_url: currentContacts.linkedin_url,
            tiktok_url: currentContacts.tiktok_url
        });
    } else {
        console.log('❌ No hay contactos cargados');
    }
    
    console.log('🔍 === FIN DEBUG ===');
}

// Función principal de inicialización
async function initializePage() {
    try {
        showLoading();
        
        // Obtener el ID del Roomz de la URL
        const roomzId = getRoomzIdFromUrl();
        if (!roomzId) {
            throw new Error('No se encontró el ID del Roomz en la URL');
        }

        console.log('🚀 Iniciando página con Roomz ID:', roomzId);
        
        // Cargar datos del Roomz
        await loadRoomzData(roomzId);
        
        // Cargar datos del anfitrión
        if (currentRoomz && currentRoomz.user_id) {
            await loadHostData(currentRoomz.user_id);
        }
        
        // Cargar contactos del anfitrión
        if (currentHost && currentHost.id) {
            await loadHostContacts(currentHost.id);
        }
        
        // Configurar fechas por defecto
        setupDefaultDates();
        
        // Debug: mostrar toda la información cargada
        debugLoadedData();
        
        // Mostrar contenido principal
        showMainContent();
        
    } catch (error) {
        console.error('Error al inicializar la página:', error);
        showError(error.message);
    }
}

// Obtener ID del Roomz de la URL
function getRoomzIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Cargar datos del Roomz
async function loadRoomzData(roomzId) {
    try {
        const url = `${API_BASE_URL}/roomz/${roomzId}`;
        console.log('🔍 Intentando cargar Roomz desde:', url);
        
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta completa de la API:', data);
        
        // Verificar que la respuesta tenga la estructura correcta
        if (data && data.room && data.room.id) {
            currentRoomz = data.room;
            console.log('🏠 Roomz cargado exitosamente:', currentRoomz);
            console.log('📝 Mensaje de la API:', data.message);
            updateRoomzUI();
        } else {
            console.error('❌ Estructura de respuesta inválida:', data);
            throw new Error('La API no devolvió un Roomz válido');
        }
    } catch (error) {
        console.error('💥 Error completo:', error);
        throw new Error(`Error al cargar datos del Roomz: ${error.message}`);
    }
}

// Cargar datos del anfitrión
async function loadHostData(userId) {
    try {
        const url = `${API_BASE_URL}/users/${userId}`;
        console.log('👤 Intentando cargar datos del anfitrión desde:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('👤 Respuesta completa del anfitrión:', data);
        
        // Verificar que la respuesta tenga la estructura correcta
        if (data && data.data && data.data.id) {
            currentHost = data.data;
            console.log('✅ Anfitrión cargado exitosamente:', currentHost);
            console.log('📝 Mensaje de la API:', data.message);
            updateHostUI();
        } else {
            console.error('❌ Estructura de respuesta del anfitrión inválida:', data);
            throw new Error('La API no devolvió datos válidos del anfitrión');
        }
    } catch (error) {
        console.error('💥 Error al cargar datos del anfitrión:', error);
        throw new Error(`Error al cargar datos del anfitrión: ${error.message}`);
    }
}

// Cargar contactos del anfitrión
async function loadHostContacts(userId) {
    try {
        const url = `${API_BASE_URL}/users/${userId}/contacts`;
        console.log('📞 Intentando cargar contactos del anfitrión desde:', url);
        
        const response = await fetch(url);
        
        if (response.status === 404) {
            // No hay contactos, mostrar mensaje
            console.log('📞 No hay contactos disponibles para este usuario (404)');
            currentContacts = null;
            updateContactsUI();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📞 Respuesta completa de contactos:', data);
        
        // Verificar que la respuesta tenga contactos válidos
        if (data && (data.whatsapp_number || data.instagram_url || data.facebook_url || data.twitter_url || data.linkedin_url || data.tiktok_url)) {
            currentContacts = data;
            console.log('✅ Contactos cargados exitosamente:', currentContacts);
            updateContactsUI();
        } else {
            // No hay contactos válidos
            console.log('📞 No se encontraron contactos válidos en la respuesta');
            currentContacts = null;
            updateContactsUI();
        }
    } catch (error) {
        console.error('💥 Error al cargar contactos:', error);
        // En caso de error, mostrar que no hay contactos disponibles
        currentContacts = null;
        updateContactsUI();
    }
}

// Actualizar interfaz del Roomz
function updateRoomzUI() {
    if (!currentRoomz) return;
    
    console.log('🎨 Actualizando UI del Roomz:', currentRoomz);
    
    // Título
    if (roomzTitleElement) {
        roomzTitleElement.textContent = currentRoomz.title || 'Sin título';
    }
    
    // Subtítulo - usar el campo subtitle de la API
    if (roomzSubtitleElement) {
        if (currentRoomz.subtitle) {
            // Si hay subtitle, usarlo directamente
            roomzSubtitleElement.textContent = currentRoomz.subtitle;
        } else {
            // Si no hay subtitle, generar uno con el tipo y dirección
            const typeText = getRoomzTypeText(currentRoomz.roomz_type);
            roomzSubtitleElement.textContent = `${typeText} en ${currentRoomz.address || 'ubicación no especificada'}`;
        }
    }
    
    // Detalles
    if (roomzDetailsElement) {
        roomzDetailsElement.textContent = currentRoomz.details || 'Sin detalles disponibles';
    }
    
    // Descripción
    if (roomzDescriptionElement) {
        roomzDescriptionElement.textContent = currentRoomz.description || 'Sin descripción disponible';
    }
    
    // Precio
    if (roomzPriceElement) {
        const formattedPrice = formatPrice(currentRoomz.price);
        roomzPriceElement.textContent = `${formattedPrice} COP`;
    }
    
    // Mostrar estado de disponibilidad si está disponible
    if (currentRoomz.is_available !== undefined) {
        console.log('📊 Estado de disponibilidad:', currentRoomz.is_available);
    }
    
    // Mostrar fecha de publicación si está disponible
    if (currentRoomz.published_at) {
        const publishedDate = new Date(currentRoomz.published_at);
        console.log('📅 Fecha de publicación:', publishedDate.toLocaleDateString('es-CO'));
    }
    
    // Actualizar desglose de precios
    updatePriceBreakdown();
}

// Actualizar interfaz del anfitrión
function updateHostUI() {
    if (!currentHost) return;
    
    console.log('👤 Actualizando UI del anfitrión:', currentHost);
    
    // Nombre del anfitrión
    if (hostNameElement) {
        const fullName = `${currentHost.first_name || ''} ${currentHost.middle_name || ''} ${currentHost.last_name || ''}`.trim();
        if (fullName) {
            hostNameElement.textContent = `Anfitrión: ${fullName}`;
        } else {
            hostNameElement.textContent = 'Anfitrión: Usuario';
        }
    }
    
    // Experiencia del anfitrión
    if (hostExperienceElement) {
        if (currentHost.created_at) {
            const createdAt = new Date(currentHost.created_at);
            const currentYear = new Date().getFullYear();
            const yearsHosting = currentYear - createdAt.getFullYear();
            
            if (yearsHosting === 0) {
                hostExperienceElement.textContent = 'Menos de 1 año anfitrionando';
            } else if (yearsHosting === 1) {
                hostExperienceElement.textContent = '1 año anfitrionando';
            } else {
                hostExperienceElement.textContent = `${yearsHosting} años anfitrionando`;
            }
        } else {
            hostExperienceElement.textContent = 'Anfitrión experimentado';
        }
    }
    
    // Mostrar información adicional del anfitrión en consola
    if (currentHost.email) {
        console.log('📧 Email del anfitrión:', currentHost.email);
    }
    if (currentHost.username) {
        console.log('👤 Username del anfitrión:', currentHost.username);
    }
    if (currentHost.city) {
        console.log('🏙️ Ciudad del anfitrión:', currentHost.city);
    }
    if (currentHost.role) {
        console.log('🎭 Rol del anfitrión:', currentHost.role);
    }
    if (currentHost.birthdate) {
        const birthDate = new Date(currentHost.birthdate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        console.log('🎂 Fecha de nacimiento del anfitrión:', birthDate.toLocaleDateString('es-CO'));
        console.log('📊 Edad del anfitrión:', age, 'años');
    }
}

// Actualizar interfaz de contactos
function updateContactsUI() {
    if (!contactLinksElement) return;
    
    console.log('📞 Actualizando UI de contactos:', currentContacts);
    
    if (!currentContacts) {
        contactLinksElement.innerHTML = '<p class="no-contacts">No hay información de contacto disponible</p>';
        return;
    }
    
    const contactLinks = [];
    
    // WhatsApp
    if (currentContacts.whatsapp_number) {
        const cleanNumber = currentContacts.whatsapp_number.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanNumber}`;
        contactLinks.push(createContactLink('whatsapp', 'WhatsApp', currentContacts.whatsapp_number, whatsappUrl));
        console.log('📱 WhatsApp disponible:', currentContacts.whatsapp_number);
    }
    
    // Instagram
    if (currentContacts.instagram_url) {
        contactLinks.push(createContactLink('instagram', 'Instagram', 'Ver perfil', currentContacts.instagram_url));
        console.log('📸 Instagram disponible:', currentContacts.instagram_url);
    }
    
    // Facebook
    if (currentContacts.facebook_url) {
        contactLinks.push(createContactLink('facebook', 'Facebook', 'Ver perfil', currentContacts.facebook_url));
        console.log('👥 Facebook disponible:', currentContacts.facebook_url);
    }
    
    // Twitter
    if (currentContacts.twitter_url) {
        contactLinks.push(createContactLink('twitter', 'Twitter', 'Ver perfil', currentContacts.twitter_url));
        console.log('🐦 Twitter disponible:', currentContacts.twitter_url);
    }
    
    // LinkedIn
    if (currentContacts.linkedin_url) {
        contactLinks.push(createContactLink('linkedin', 'LinkedIn', 'Ver perfil', currentContacts.linkedin_url));
        console.log('💼 LinkedIn disponible:', currentContacts.linkedin_url);
    }
    
    // TikTok
    if (currentContacts.tiktok_url) {
        contactLinks.push(createContactLink('tiktok', 'TikTok', 'Ver perfil', currentContacts.tiktok_url));
        console.log('🎵 TikTok disponible:', currentContacts.tiktok_url);
    }
    
    if (contactLinks.length === 0) {
        contactLinksElement.innerHTML = '<p class="no-contacts">No hay redes sociales disponibles</p>';
        console.log('❌ No se encontraron contactos válidos');
    } else {
        contactLinksElement.innerHTML = contactLinks.join('');
        console.log(`✅ ${contactLinks.length} contacto(s) mostrado(s)`);
    }
}

// Crear enlace de contacto
function createContactLink(platform, name, text, url) {
    const icon = getSocialIcon(platform);
    return `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="contact-link">
            ${icon}
            <span>${name}</span>
        </a>
    `;
}

// Obtener icono de red social
function getSocialIcon(platform) {
    const icons = {
        whatsapp: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>`,
        instagram: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.323z"/>
        </svg>`,
        facebook: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>`,
        twitter: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>`,
        linkedin: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>`,
        tiktok: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>`
    };
    
    return icons[platform] || icons.instagram;
}

// Obtener texto del tipo de Roomz
function getRoomzTypeText(type) {
    const types = {
        'studio': 'Estudio',
        'apartment': 'Apartamento',
        'residential_complex': 'Conjunto residencial'
    };
    
    return types[type] || 'Alojamiento';
}

// Formatear precio
function formatPrice(price) {
    if (!price) return '0';
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '0';
    
    return numPrice.toLocaleString('es-CO');
}

// Actualizar desglose de precios
function updatePriceBreakdown() {
    if (!currentRoomz || !currentRoomz.price) return;
    
    const price = parseFloat(currentRoomz.price);
    if (isNaN(price)) return;
    
    const formattedPrice = formatPrice(price);
    
    if (priceBreakdownTextElement) {
        priceBreakdownTextElement.textContent = `${formattedPrice} COP x 1 mes`;
    }
    
    if (priceBreakdownTotalElement) {
        priceBreakdownTotalElement.textContent = `${formattedPrice} COP`;
    }
    
    if (priceTotalElement) {
        priceTotalElement.textContent = `${formattedPrice} COP`;
    }
}

// Configurar fechas por defecto
function setupDefaultDates() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    if (checkinElement) {
        checkinElement.value = today.toISOString().split('T')[0];
    }
    
    if (checkoutElement) {
        checkoutElement.value = nextMonth.toISOString().split('T')[0];
    }
}

// Funciones de UI
function showLoading() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    mainContentElement.classList.add('hidden');
}

function showError(message) {
    loadingElement.classList.add('hidden');
    errorElement.classList.remove('hidden');
    mainContentElement.classList.add('hidden');
    
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
    }
}

function showMainContent() {
    loadingElement.classList.add('hidden');
    errorElement.classList.add('hidden');
    mainContentElement.classList.remove('hidden');
}

// Funciones de reserva
function toggleGuestDropdown() {
    guestDropdownElement.classList.toggle('show');
}

function changeGuests(change) {
    const newCount = guestCount + change;
    
    if (newCount >= 1 && newCount <= 10) {
        guestCount = newCount;
        updateGuestDisplay();
        updateGuestCounter();
        updateDecreaseButton();
    }
}

function updateGuestDisplay() {
    if (guestDisplayElement) {
        guestDisplayElement.textContent = `${guestCount} huésped${guestCount !== 1 ? 'es' : ''}`;
    }
}

function updateGuestCounter() {
    if (guestCountElement) {
        guestCountElement.textContent = guestCount;
    }
}

function updateDecreaseButton() {
    if (decreaseBtnElement) {
        decreaseBtnElement.disabled = guestCount <= 1;
    }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function(event) {
    if (!event.target.closest('.guest-input')) {
        guestDropdownElement.classList.remove('show');
    }
});

// Inicializar contador de huéspedes
updateGuestDisplay();
updateGuestCounter();
updateDecreaseButton();
