// js/script.js

// Mappatura dei codici meteo in descrizioni in italiano
const weatherDescriptions = {
  "0": "Cielo sereno",
  "1": "Prevalentemente sereno",
  "2": "Parzialmente nuvoloso",
  "3": "Nuvoloso",
  "45": "Nebbia",
  "48": "Nebbia gelida",
  "51": "Leggera pioviggine",
  "53": "Pioviggine moderata",
  "55": "Pioviggine intensa",
  "56": "Leggera pioggia gelida",
  "57": "Pioggia gelida intensa",
  "61": "Leggera pioggia",
  "63": "Pioggia moderata",
  "65": "Pioggia intensa",
  "66": "Leggera pioggia gelida",
  "67": "Pioggia gelida intensa",
  "71": "Leggera nevicata",
  "73": "Nevicata moderata",
  "75": "Nevicata intensa",
  "77": "Granelli di neve",
  "80": "Rovesci leggeri",
  "81": "Rovesci moderati",
  "82": "Rovesci intensi",
  "85": "Rovesci di neve leggeri",
  "86": "Rovesci di neve intensi",
  "95": "Temporale lieve o moderato",
  "96": "Temporale con grandine leggera",
  "99": "Temporale con grandine intensa"
};

let suggestionTimeout = null;

// Funzione per ottenere suggerimenti di città
function fetchCitySuggestions() {
  const cityInput = document.getElementById('city').value.trim();
  const countryCode = document.getElementById('country').value;
  if (cityInput.length < 2) return; // Avvia i suggerimenti solo se ci sono almeno 2 caratteri
  
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&country=${countryCode}&count=5&language=it`;
  
  fetch(geoUrl)
    .then(response => response.json())
    .then(data => {
      const dataList = document.getElementById('citySuggestions');
      dataList.innerHTML = ""; // Pulizia dei suggerimenti precedenti
      if (data.results) {
        data.results.forEach(city => {
          const option = document.createElement('option');
          option.value = city.name;
          dataList.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error("Errore durante il recupero dei suggerimenti:", error);
    });
}

// Aggiunge il listener solo se l'elemento "city" esiste (solo su index.html)
if (document.getElementById('city')) { 
  document.getElementById('city').addEventListener('input', () => {
    clearTimeout(suggestionTimeout);
    suggestionTimeout = setTimeout(fetchCitySuggestions, 500);
  });

  document.getElementById('city').addEventListener('keydown', function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      getWeather();
    }
  });
}

// Funzione per recuperare e mostrare il meteo
function getWeather() {
  const cityInput = document.getElementById('city').value.trim();
  const countryCode = document.getElementById('country').value;
  if (!cityInput) {
    alert("Inserisci il nome di una città.");
    return;
  }
  
  // Recupera le coordinate della città
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&country=${countryCode}&count=1&language=it`;
  fetch(geoUrl)
    .then(response => response.json())
    .then(geoData => {
      if (!geoData.results || geoData.results.length === 0) {
        document.getElementById('result').innerHTML = `<p>Nessuna città trovata. Riprova.</p>`;
        return;
      }
      const cityData = geoData.results[0];
      const lat = cityData.latitude;
      const lon = cityData.longitude;
      
      // Chiamata API per ottenere il meteo corrente
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
      fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
          if (!weatherData.current_weather) {
            document.getElementById('result').innerHTML = `<p>Impossibile recuperare i dati del meteo.</p>`;
            return;
          }
          const current = weatherData.current_weather;
          const weatherCode = current.weathercode.toString();
          const description = weatherDescriptions[weatherCode] || "Condizioni variabili";
          const output = `
            <h2>Meteo a ${cityData.name}</h2>
            <p><strong>Temperatura:</strong> ${current.temperature}°C</p>
            <p><strong>Condizioni:</strong> ${description}</p>
            <p><strong>Vento:</strong> ${current.windspeed} m/s</p>
            <p><em>Ultimo aggiornamento: ${current.time}</em></p>
          `;
          document.getElementById('result').innerHTML = output;
        })
        .catch(error => {
          document.getElementById('result').innerHTML = `<p>Errore nel recupero dei dati meteo.</p>`;
          console.error("Errore meteo:", error);
        });
    })
    .catch(error => {
      document.getElementById('result').innerHTML = `<p>Errore nel recupero dei dati della città.</p>`;
      console.error("Errore geocodifica:", error);
    });
}

document.getElementById('fetchWeather')?.addEventListener('click', getWeather);
