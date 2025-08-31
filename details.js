// Variables globales
let currentAccommodation = null;
let isLoading = false;

// Elementos del DOM
const elements = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  mainContent: document.getElementById('mainContent'),
  title: document.getElementById('accommodationTitle'),
  type: document.getElementById('accommodationType'),
  price: document.getElementById('price'),
  details: document.getElementById('details'),
  rating: document.getElementById('rating'),
  description: document.getElementById('description'),
  hostName: document.getElementById('hostName'),
  hostExperience: document.getElementById('hostExperience'),
  hostAvatar: document.getElementById('hostAvatar'),
  checkIn: document.getElementById('checkIn'),
  checkOut: document.getElementById('checkOut'),
  guests: document.getElementById('guests'),
  amenitiesList: document.getElementById('amenitiesList'),
  searchInput: document.getElementById('searchInput'),
  bookBtn: document.getElementById('bookBtn')
};

// Función para mostrar/ocultar loading
function toggleLoading(show) {
  isLoading = show;
  elements.loading.style.display = show ? 'flex' : 'none';
  elements.mainContent.style.display = show ? 'none' : 'block';
  elements.error.style.display = 'none';
}

// Función para mostrar errores
function showError(message = 'Error al cargar los datos') {
  elements.error.style.display = 'block';
  elements.loading.style.display = 'none';
  elements.mainContent.style.display = 'none';
  elements.error.querySelector('p').textContent = message;
}

// Función para formatear precio
function formatPrice(price, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price);
}

// Función para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Función para cargar imágenes en la galería
function loadGalleryImages(images) {
  const galleryImages = document.querySelectorAll('.gallery .img');
  
  images.forEach((imageUrl, index) => {
    if (galleryImages[index]) {
      galleryImages[index].style.backgroundImage = `url(${imageUrl})`;
      galleryImages[index].style.backgroundSize = 'cover';
      galleryImages[index].style.backgroundPosition = 'center';
    }
  });
}

// Función para renderizar amenidades
function renderAmenities(amenities) {
  elements.amenitiesList.innerHTML = amenities.map(amenity => `
    <div class="amenity-item">
      <span class="amenity-icon">${amenity.icon}</span>
      <span class="amenity-name">${amenity.name}</span>
    </div>
  `).join('');
}

// Función para renderizar estrellas de rating
function renderRating(rating, reviewsCount) {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  elements.rating.innerHTML = `
    <span class="stars">${stars}</span>
    <span class="reviews">${rating} (${reviewsCount} reseñas)</span>
  `;
}

// Función principal para cargar datos del alojamiento
async function loadAccommodation(userId = 1) {
  toggleLoading(true);
  
  try {
    // Obtener datos de usuarios de la API real
    const response = await roomieAPI.getAllUsers();
    
    // Extraer el array de usuarios de la respuesta
    const users = response.data || response;
    
    // Buscar el usuario específico o usar el primero disponible
    const userData = users.find(user => user.id === userId) || users[0];
    
    if (!userData) {
      throw new Error('No se encontraron usuarios');
    }
    
    // Convertir datos de usuario a formato de alojamiento
    const accommodationData = convertUserToAccommodation(userData);
    currentAccommodation = accommodationData;
    
    // Actualizar contenido
    updateAccommodationContent(accommodationData);
    
    toggleLoading(false);
    
  } catch (error) {
    console.error('Error loading accommodation:', error);
    
    // En caso de error, usar datos mock como fallback
    console.log('Usando datos de ejemplo debido al error de API');
    currentAccommodation = mockData.accommodation;
    updateAccommodationContent(mockData.accommodation);
    toggleLoading(false);
    
    // Mostrar advertencia en consola
    console.warn('API no disponible, mostrando datos de ejemplo');
  }
}

// Función para convertir datos de usuario a formato de alojamiento
function convertUserToAccommodation(userData) {
  const cities = {
    'Cartagena': 'Cartagena, Colombia',
    'Barranquilla': 'Barranquilla, Colombia',
    'Medellín': 'Medellín, Colombia'
  };
  
  const roleDescriptions = {
    'student': 'Habitación para estudiante',
    'landlord': 'Alojamiento completo'
  };
  
  return {
    id: userData.id,
    title: `${roleDescriptions[userData.role] || 'Alojamiento'} en ${cities[userData.city] || userData.city}`,
    type: `Ofrecido por: ${userData.first_name} ${userData.last_name}`,
    price: userData.role === 'student' ? 450000 : 999000,
    currency: "COP",
    period: "mes",
    rooms: userData.role === 'student' ? 1 : 3,
    bathrooms: 1,
    disabled_access: 2,
    rating: 4.5 + (userData.id * 0.1),
    reviews_count: 50 + (userData.id * 10),
    description: `Alojamiento disponible en ${userData.city}. Contacta con ${userData.first_name} para más detalles. Usuario registrado desde ${new Date(userData.created_at).getFullYear()}.`,
    images: [
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
      "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg",
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg",
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg"
    ],
    amenities: [
      { icon: "🌐", name: "WiFi gratuito" },
      { icon: "🅿️", name: "Estacionamiento" },
      { icon: "🏊", name: "Piscina" },
      { icon: "🏋️", name: "Gimnasio" },
      { icon: "🧺", name: "Lavandería" },
      { icon: "❄️", name: "Aire acondicionado" }
    ],
    host: {
      id: userData.id,
      name: `${userData.first_name} ${userData.last_name}`,
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      experience_years: new Date().getFullYear() - new Date(userData.created_at).getFullYear() || 1,
      rating: 4.9,
      response_rate: 98,
      email: userData.email,
      username: userData.username
    },
    location: {
      city: userData.city,
      country: "Colombia"
    },
    availability: {
      check_in: "2025-01-17",
      check_out: "2025-01-19",
      guests: 1
    }
  };
}

// Función para actualizar el contenido con los datos
function updateAccommodationContent(data) {
  // Información básica
  elements.title.textContent = data.title;
  elements.type.textContent = data.type;
  elements.price.innerHTML = `${formatPrice(data.price)} <span>por 1 ${data.period}</span>`;
  elements.details.textContent = `${data.rooms} habitaciones • ${data.disabled_access} acceso para discapacitados • ${data.bathrooms} baño`;
  elements.description.textContent = data.description;
  
  // Rating
  renderRating(data.rating, data.reviews_count);
  
  // Información del anfitrión
  elements.hostName.textContent = data.host.name;
  elements.hostExperience.textContent = `${data.host.experience_years} años anfitrionando`;
  elements.hostAvatar.style.backgroundImage = `url(${data.host.avatar})`;
  elements.hostAvatar.style.backgroundSize = 'cover';
  elements.hostAvatar.style.backgroundPosition = 'center';
  
  // Fechas
  elements.checkIn.textContent = formatDate(data.availability.check_in);
  elements.checkOut.textContent = formatDate(data.availability.check_out);
  elements.guests.textContent = `${data.availability.guests} huésped${data.availability.guests > 1 ? 's' : ''}`;
  
  // Galería de imágenes
  loadGalleryImages(data.images);
  
  // Amenidades
  renderAmenities(data.amenities);
}

// Función para buscar alojamientos
async function searchAccommodations(query) {
  if (!query.trim()) return;
  
  toggleLoading(true);
  
  try {
    // Obtener todos los usuarios y filtrar por ciudad o nombre
    const response = await roomieAPI.getAllUsers();
    const users = response.data || response;
    
    // Filtrar usuarios por query
    const filteredUsers = users.filter(user => 
      user.city.toLowerCase().includes(query.toLowerCase()) ||
      user.first_name.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredUsers.length > 0) {
      const accommodationData = convertUserToAccommodation(filteredUsers[0]);
      updateAccommodationContent(accommodationData);
    } else {
      // Si no hay resultados, mostrar el primer usuario disponible
      const accommodationData = convertUserToAccommodation(users[0]);
      updateAccommodationContent(accommodationData);
    }
    
    toggleLoading(false);
    
  } catch (error) {
    console.error('Error searching accommodations:', error);
    
    // En caso de error, usar datos mock
    updateAccommodationContent(mockData.accommodation);
    toggleLoading(false);
  }
}

// Función para hacer una reserva
async function makeReservation() {
  if (!currentAccommodation) {
    alert('No hay alojamiento seleccionado');
    return;
  }
  
  const reservationData = {
    accommodation_id: currentAccommodation.id,
    check_in: currentAccommodation.availability.check_in,
    check_out: currentAccommodation.availability.check_out,
    guests: currentAccommodation.availability.guests,
    total_price: currentAccommodation.price
  };
  
  try {
    elements.bookBtn.disabled = true;
    elements.bookBtn.textContent = 'Procesando...';
    
    // Usar la API real para crear reserva
    const reservation = await roomieAPI.createReservation(reservationData);
    
    console.log('Reserva creada:', reservation);

    alert('¡Reserva realizada con éxito! Te enviaremos un email de confirmación.');
    elements.bookBtn.textContent = 'Reservado ✓';
    elements.bookBtn.style.backgroundColor = '#10b981';
    
  } catch (error) {
    console.error('Error making reservation:', error);
    alert('Error al procesar la reserva. Intenta de nuevo.');
    elements.bookBtn.disabled = false;
    elements.bookBtn.textContent = 'Reservar ahora';
  }
}

// Función para verificar disponibilidad
async function checkAvailability(accommodationId, startDate, endDate) {
  try {
    // Usar la API real para verificar disponibilidad
    const availability = await roomieAPI.getAvailability(accommodationId, startDate, endDate);
    
    if (availability) return availability;

    return {
      available: true,
      price_per_night: currentAccommodation?.price || 0,
      total_price: (currentAccommodation?.price || 0) * 30 // Ejemplo para un mes
    };
    
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}

// Función para cargar reseñas
async function loadReviews(accommodationId, page = 1) {
  try {
    // Usar la API real para cargar reseñas
    const reviews = await roomieAPI.getReviews(accommodationId, page);
    
    if (reviews) return reviews;
    
    // Fallback con datos mock
    return {
      reviews: [
        {
          id: 1,
          user: "María García",
          rating: 5,
          comment: "Excelente lugar, muy limpio y cómodo. La vista es increíble.",
          date: "2024-12-15"
        },
        {
          id: 2,
          user: "Carlos Rodríguez",
          rating: 4,
          comment: "Muy buena ubicación y el anfitrión muy atento.",
          date: "2024-12-10"
        }
      ],
      total: 127,
      current_page: page
    };
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    throw error;
  }
}

// Función para probar la conexión con la API
async function testAPIConnection() {
  try {
    const isConnected = await roomieAPI.testConnection();
    if (!isConnected) {
      console.log('API no disponible, usando datos de ejemplo');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Error testing API connection, using mock data:', error);
    return false;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Probar conexión con API al cargar
  testAPIConnection();
  
  // Cargar alojamiento inicial
  loadAccommodation();
  
  // Configurar búsqueda
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (e.target.value.length > 2) {
        searchAccommodations(e.target.value);
      }
    }, 500);
  });
  
  // Manejar tecla Enter en búsqueda
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchAccommodations(e.target.value);
    }
  });
  
  // Configurar menú desplegable
  setupDropdownMenu();
});

// Función para configurar el menú desplegable
function setupDropdownMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const dropdown = document.getElementById('dropdown');
  
  // Toggle del menú
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  
  // Cerrar menú al presionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('show');
    }
  });
}

// Funciones para las opciones del menú
function goToUserSettings() {
  console.log('Navegando a configuración de usuario...');
  // Aquí puedes agregar la lógica para navegar a la página de configuración
  // window.location.href = '/user-settings';
  alert('Redirigiendo a configuración de usuario...');
  closeDropdown();
}

function goToLogin() {
  console.log('Navegando a login...');
  // Aquí puedes agregar la lógica para navegar a la página de login
  // window.location.href = '/login';
  alert('Redirigiendo a página de login...');
  closeDropdown();
}

function logout() {
  console.log('Cerrando sesión...');
  // Aquí puedes agregar la lógica para cerrar sesión
  // Ejemplo: limpiar localStorage, cookies, etc.
  // localStorage.removeItem('authToken');
  // window.location.href = '/';
  
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    alert('Sesión cerrada exitosamente');
    closeDropdown();
  }
}

function closeDropdown() {
  const dropdown = document.getElementById('dropdown');
  dropdown.classList.remove('show');
}

// Funciones de utilidad para manejo de errores
function handleNetworkError(error) {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }
  return 'Error inesperado. Intenta de nuevo más tarde.';
}

// Función para retry automático
async function retryRequest(requestFunction, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFunction();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

console.log('RoomieZ API initialized');