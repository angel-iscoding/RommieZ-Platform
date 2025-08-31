
        // ===== MOCK DATA Y FUNCIONES =====
        
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

        // ===== MOCK FETCH FUNCTIONS =====

        // Mock function to get pubs
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
                        message: 'Pubs get successful'
                    });
                }, 1000); // Simulate red delay
            });
        }

        // Mock function to seacrh pubs
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
                        message: `${filteredPublications.length} results find`
                    });
                }, 800);
            });
        }

        // Mock function to get details user
        async function mockFetchUserDetails(userId) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const user = mockDatabase.users.find(u => u.id === userId);
                    resolve({
                        success: true,
                        data: user,
                        message: 'details user get successful'
                    });
                }, 500);
            });
        }

        // ===== UI FUNCTIONS =====

        // Function to rendern pubs
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
                <div class="publication-card fade-in" data-id="${pub.id}" onclick="goToPublicationDetail(${pub.id})">
                    <div class="card-image">
                        <svg class="camera-icon" viewBox="0 0 24 24" fill="#ccc">
                            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
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

        // Function to show cards pubs on the display
        function showLoading() {
            document.getElementById('loadingState').style.display = 'block';
            document.getElementById('publicationsGrid').style.display = 'none';
            document.getElementById('publicationsGrid2').style.display = 'none';
        }

        // Fuction to hover cards pubs on the display
        function hideLoading() {
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('publicationsGrid').style.display = 'grid';
        }

        // ===== NAVEGATION FUCTIONS =====

        // Function to go to details page
        function goToPublicationDetail(publicationId) {
            console.log(`navegate for pub ${publicationId}`);
            
            // Simular navegación (en una app real sería window.location.href o router)
            alert(`Navegando al detalle de la RoomZ ID: ${publicationId}\n\n(En una aplicación real, esto abriría la página de detalles)`);
            
            // Mock fetch para obtener detalles
            mockFetchPublicationDetail(publicationId);
        }

        // Mock function para obtener detalle de publicación
        async function mockFetchPublicationDetail(id) {
            console.log(`Mock Fetch: get pubs details${id}`);
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    const publication = mockDatabase.publications.find(p => p.id === id);
                    const user = mockDatabase.users.find(u => u.id === publication?.user_id);
                    
                    resolve({
                        success: true,
                        data: {
                            ...publication,
                            landlord: user
                        },
                        message: 'details get succesful'
                    });
                }, 600);
            });
        }

        // ===== EVENT LISTENERS =====

        document.addEventListener('DOMContentLoaded', async function() {
            // Cargar publicaciones iniciales
            await loadPublications();

            // Home button
            document.getElementById('RoomZBtn').addEventListener('click', async function() {
                await loadPublications();
            });

            // Menu dropdown
            document.getElementById('menuBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('dropdownMenu');
                dropdown.classList.toggle('active');
            });

            // Filter input
            const filterInput = document.getElementById('filterInput');
            const filterDropdown = document.getElementById('filterDropdown');
            
            filterInput.addEventListener('focus', function() {
                filterDropdown.classList.add('active');
            });

            filterInput.addEventListener('input', async function() {
                const query = this.value.trim();
                if (query.length > 2) {
                    console.log(`search: "${query}"`);
                    showLoading();
                    const response = await mockSearchPublications(query);
                    hideLoading();
                    renderPublications(response.data);
                } else if (query.length === 0) {
                    await loadPublications();
                }
            });

            // Filter options
            document.querySelectorAll('.filter-option').forEach(option => {
                option.addEventListener('submit', async function() {
                    const filter = this.dataset.filter;
                    
                    filterDropdown.classList.remove('active');
                    filterInput.value = this.textContent;
                    
                    showLoading();
                    const response = await mockFetchPublications(filter);
                    hideLoading();
                    renderPublications(response.data);
                });
            });

            // Menu options
            document.getElementById('loginBtn').addEventListener('click', function() {
                console.log('Mock: Iniciar sesión');
                alert('Mock: Redirect to login');
            });

            document.getElementById('configBtn').addEventListener('click', function() {
                console.log('Mock: config user');
                alert('Mock: open user config');
            });

            document.getElementById('logoutBtn').addEventListener('click', function() {
                console.log('Mock: logout');
                if (confirm('are you sure logout?')) {
                    alert('Mock: logout sucessful');
                }
            });

            // Cerrar dropdowns al hacer click fuera
            document.addEventListener('click', function() {
                document.getElementById('dropdownMenu').classList.remove('active');
                document.getElementById('filterDropdown').classList.remove('active');
            });
        });

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
                console.error(' Error cargando publicaciones:', error);
                hideLoading();
                document.getElementById('publicationsGrid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94618E;">
                        <h3>Error al cargar las RoomZ</h3>
                        <p>${error.message}</p>
                        <button onclick="loadPublications()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #94618E; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                `;
                document.getElementById('publicationsGrid2').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94618E;">
                        <h3>Error al cargar las RoomZ</h3>
                        <p>${error.message}</p>
                        <button onclick="loadPublications()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #94618E; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Reintentar
                        </button>
                    </div>
                `;
            }
        }

        // ===== UTILIDADES DE CONSOLA PARA TESTING =====

        // Exponer funciones para testing en consola
        window.RoomZMocks = {
            fetchPublications: mockFetchPublications,
            searchPublications: mockSearchPublications,
            fetchUserDetails: mockFetchUserDetails,
            database: mockDatabase
        };