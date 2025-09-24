<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear Producto con Geolocalización</title>
    <!-- Carga de Tailwind CSS para un diseño moderno -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Carga de la biblioteca Leaflet para el mapa -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha2d1b+gS1HjE1k8L3yJ0fF8gX5fB5C8yL9j3hD3J0w1hYj8s=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha2d1b+gS1HjE1k8L3yJ0fF8gX5fB5C8yL9j3hD3J0w1hYj8s=" crossorigin=""></script>
    <style>
        /* Asegurarse de que el mapa tenga una altura */
        #map { height: 400px; width: 100%; }
        /* Estilos personalizados para las sugerencias de la API */
        .suggestion-item {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #e5e7eb;
        }
        .suggestion-item:hover {
            background-color: #f3f4f6;
        }
    </style>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">

    <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Crear Artículo con Geolocalización</h1>

        <!-- Campo de entrada de dirección -->
        <div class="mb-4">
            <label for="addressInput" class="block text-sm font-medium text-gray-700 mb-2">
                Ubicación del Artículo
            </label>
            <input type="text" id="addressInput" placeholder="Ej: Avenida Colón 1500, Córdoba"
                   class="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
        </div>

        <!-- Contenedor para las sugerencias de la API -->
        <div id="suggestionsContainer" class="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto hidden"></div>

        <!-- Contenedor del mapa -->
        <div id="map" class="rounded-lg shadow-md mt-6 hidden"></div>

        <!-- Sección para mostrar la información de la ubicación seleccionada -->
        <div id="locationInfo" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 hidden">
            <p><strong>Ubicación seleccionada:</strong> <span id="selectedAddress"></span></p>
            <p><strong>Coordenadas:</strong> Latitud <span id="latCoord"></span>, Longitud <span id="lonCoord"></span></p>
        </div>
    </div>

    <script>
        const addressInput = document.getElementById('addressInput');
        const suggestionsContainer = document.getElementById('suggestionsContainer');
        const mapContainer = document.getElementById('map');
        const locationInfo = document.getElementById('locationInfo');
        const selectedAddressSpan = document.getElementById('selectedAddress');
        const latCoordSpan = document.getElementById('latCoord');
        const lonCoordSpan = document.getElementById('lonCoord');

        let map = null;
        let marker = null;
        let debounceTimeout;

        // Función para inicializar o actualizar el mapa y el marcador
        function initMap(lat, lon, address) {
            // Mostrar los contenedores ocultos
            mapContainer.classList.remove('hidden');
            locationInfo.classList.remove('hidden');

            // Actualizar la información de la ubicación
            selectedAddressSpan.textContent = address;
            latCoordSpan.textContent = lat.toFixed(6);
            lonCoordSpan.textContent = lon.toFixed(6);

            // Si el mapa ya existe, simplemente actualiza la vista y el marcador
            if (map) {
                map.setView([lat, lon], 13);
                if (marker) {
                    marker.setLatLng([lat, lon]);
                } else {
                    marker = L.marker([lat, lon]).addTo(map);
                }
            } else {
                // Si el mapa no existe, créalo por primera vez
                map = L.map('map').setView([lat, lon], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(map);
                marker = L.marker([lat, lon]).addTo(map);
                
                // Añadir evento de clic al mapa para seleccionar una ubicación
                map.on('click', function(e) {
                    const lat = e.latlng.lat;
                    const lon = e.latlng.lng;
                    reverseGeocode(lat, lon);
                });
            }
        }

        // Función para buscar ubicaciones a medida que el usuario escribe
        async function fetchAddresses(query) {
            if (query.length < 3) {
                suggestionsContainer.classList.add('hidden');
                return;
            }

            try {
                // Añado "Córdoba" a la consulta para restringir la búsqueda a la provincia
                const fullQuery = `${query}, Córdoba`;
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${fullQuery}&countrycodes=ar`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                    }
                });
                const data = await response.json();
                displaySuggestions(data);
            } catch (error) {
                console.error("Error al buscar la dirección:", error);
                suggestionsContainer.classList.add('hidden');
            }
        }

        // Función para buscar la dirección a partir de coordenadas (geocodificación inversa)
        async function reverseGeocode(lat, lon) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                    }
                });
                const data = await response.json();
                const address = data.display_name || `Lat: ${lat}, Lon: ${lon}`;
                initMap(lat, lon, address);
                // Actualiza el valor del input con la dirección obtenida de la geocodificación inversa
                addressInput.value = address;
            } catch (error) {
                console.error("Error al buscar la dirección por coordenadas:", error);
                initMap(lat, lon, "Dirección no encontrada");
                addressInput.value = "Dirección no encontrada";
            }
        }

        // Función para mostrar las sugerencias en la interfaz
        function displaySuggestions(locations) {
            suggestionsContainer.innerHTML = '';
            if (locations.length > 0) {
                locations.forEach(location => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'suggestion-item';
                    
                    let formattedAddress = location.display_name;

                    // Verifica si la dirección contiene un número y una calle para formatearla
                    if (location.address && location.address.road && location.address.house_number) {
                        const city = location.address.city || location.address.town || location.address.village || 'Ciudad';
                        const state = location.address.state || 'Córdoba';
                        formattedAddress = `${location.address.road} ${location.address.house_number}, ${city}, ${state}`;
                    }
                    
                    suggestionItem.textContent = formattedAddress;
                    suggestionItem.dataset.lat = location.lat;
                    suggestionItem.dataset.lon = location.lon;
                    
                    // Almacena la dirección formateada para usarla al hacer clic
                    suggestionItem.dataset.address = formattedAddress;

                    // Agregar un evento para manejar la selección de la sugerencia
                    suggestionItem.addEventListener('click', () => {
                        initMap(parseFloat(location.lat), parseFloat(location.lon), suggestionItem.dataset.address);
                        suggestionsContainer.classList.add('hidden');
                        addressInput.value = suggestionItem.dataset.address;
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.classList.remove('hidden');
            } else {
                suggestionsContainer.classList.add('hidden');
            }
        }

        // Evento 'input' con un temporizador para evitar llamadas excesivas a la API
        addressInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const query = addressInput.value.trim();
                if (query) {
                    fetchAddresses(query);
                } else {
                    suggestionsContainer.classList.add('hidden');
                }
            }, 300); // Espera 300ms después de que el usuario deja de escribir
        });
    </script>

</body>
</html>
