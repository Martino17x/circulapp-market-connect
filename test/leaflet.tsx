import React, { useState, useEffect, useRef } from 'react';

// Componente principal de la aplicación
const App = () => {
  // Estados para manejar los datos y la UI
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Referencias para los elementos del mapa de Leaflet
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Efecto para inicializar el mapa una sola vez
  useEffect(() => {
    // Carga dinámica de Leaflet y su CSS
    const loadLeaflet = () => {
        // Carga el CSS de Leaflet
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.crossOrigin = '';
        document.head.appendChild(leafletCss);

        // Carga el JS de Leaflet
        const leafletJs = document.createElement('script');
        leafletJs.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJs.crossOrigin = '';
        
        leafletJs.onload = () => {
          // El mapa se inicializa en una función diferida para asegurar que el DOM esté listo
          setTimeout(() => {
            if (mapRef.current) return;
            
            const L = window.L;
            
            // Verifica que el contenedor del mapa exista antes de inicializarlo
            if (mapContainerRef.current) {
                const initialLat = -31.4167;
                const initialLon = -64.1833;
                mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLon], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(mapRef.current);

                // Crea el marcador inicial y lo guarda en la referencia
                markerRef.current = L.marker([initialLat, initialLon]).addTo(mapRef.current);
                
                // Oculta el contenedor del mapa inicialmente
                mapContainerRef.current.style.display = 'none';
                setLoading(false); // La carga ha finalizado, oculta el indicador
            }
          }, 0);
        };
        document.head.appendChild(leafletJs);
    };

    loadLeaflet();
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente

  // Efecto para manejar la lógica de búsqueda con debounce
  useEffect(() => {
    const fetchAddresses = async () => {
      if (addressQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const fullQuery = `${addressQuery}, Cordoba, Argentina`;
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${fullQuery}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error al buscar la dirección:", error);
        setSuggestions([]);
      }
    };

    // Temporizador para el debounce
    const debounceTimeout = setTimeout(() => {
      fetchAddresses();
    }, 300);

    // Función de limpieza para cancelar el temporizador anterior
    return () => clearTimeout(debounceTimeout);
  }, [addressQuery]); // Se ejecuta cada vez que el valor de addressQuery cambia

  // Efecto para actualizar el mapa cuando se selecciona una ubicación
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const { lat, lon } = selectedLocation;
      const L = window.L;

      // Muestra el contenedor del mapa
      mapContainerRef.current.style.display = 'block';

      // Actualiza la vista del mapa y la posición del marcador
      mapRef.current.setView([lat, lon], 13);
      markerRef.current.setLatLng([lat, lon]);

      // Oculta las sugerencias
      setSuggestions([]);
    }
  }, [selectedLocation]); // Se ejecuta cuando se actualiza la ubicación seleccionada

  // Renderizado de la UI del componente
  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Crear Artículo con Geolocalización</h1>

        {/* Campo de entrada de dirección */}
        <div className="mb-4">
          <label htmlFor="addressInput" className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación del Artículo
          </label>
          <input
            id="addressInput"
            type="text"
            placeholder="Ej: Cruz del Eje"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        {/* Contenedor para las sugerencias de la API */}
        {suggestions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((location) => (
              <div
                key={location.place_id}
                className="suggestion-item cursor-pointer p-2 hover:bg-gray-100"
                onClick={() => setSelectedLocation({ lat: location.lat, lon: location.lon, address: location.display_name })}
              >
                {location.display_name}
              </div>
            ))}
          </div>
        )}

        {/* Contenedor del mapa y mensaje de carga */}
        {loading ? (
            <div className="rounded-lg shadow-md mt-6 p-4 text-center text-gray-500 bg-gray-100">
                Cargando mapa...
            </div>
        ) : (
            <>
                <div ref={mapContainerRef} id="map" className="rounded-lg shadow-md mt-6" style={{ height: '400px' }}></div>
                {/* Sección para mostrar la información de la ubicación seleccionada */}
                {selectedLocation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <p><strong>Ubicación seleccionada:</strong> {selectedLocation.address}</p>
                    <p><strong>Coordenadas:</strong> Latitud {parseFloat(selectedLocation.lat).toFixed(6)}, Longitud {parseFloat(selectedLocation.lon).toFixed(6)}</p>
                  </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default App;
