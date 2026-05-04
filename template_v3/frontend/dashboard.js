// Referencias a los elementos del DOM
const ui = {
  tempInt: document.getElementById('temp-int'),
  tempExt: document.getElementById('temp-ext'),
  presion: document.getElementById('presion'),
  luz: document.getElementById('luz'),
  brujula: document.getElementById('brujula'),
  gpsLat: document.getElementById('gps-lat'),
  gpsLon: document.getElementById('gps-lon'),
  batVolt: document.getElementById('bat-volt'),
  batCurr: document.getElementById('bat-curr')
};

// Mapeo de nombres del Pico a los campos del dashboard
function mapearDatos(datos) {
  return {
    tempInt: datos.dht_temp ?? datos.bme_temp ?? 0,
    tempExt: datos.bme_temp ?? datos.dht_temp ?? 0,
    presion: datos.bme_pres ?? 0,
    luz: datos.uv ?? 0,
    brujula: 0,
    gpsLat: datos.gps_lat ?? 0,
    gpsLon: datos.gps_lon ?? 0,
    batVolt: 0,
    batCurr: 0
  };
}

// Actualizar la interfaz
function actualizarDashboard(datos) {
  ui.tempInt.innerText = datos.tempInt ? `${datos.tempInt.toFixed(1)} °C` : 'N/A';
  ui.tempExt.innerText = datos.tempExt ? `${datos.tempExt.toFixed(1)} °C` : 'N/A';
  ui.presion.innerText = datos.presion ? `${datos.presion.toFixed(1)} hPa` : 'N/A';
  ui.luz.innerText = datos.luz ? `UV: ${datos.luz}` : 'N/A';
  ui.gpsLat.innerText = datos.gpsLat ? datos.gpsLat.toFixed(6) : 'N/A';
  ui.gpsLon.innerText = datos.gpsLon ? datos.gpsLon.toFixed(6) : 'N/A';
  ui.batVolt.innerText = datos.batVolt ? `${datos.batVolt.toFixed(1)} V` : 'N/A';
  ui.batCurr.innerText = datos.batCurr ? `${datos.batCurr.toFixed(1)} A` : 'N/A';
}

// Conexión WebSocket al servidor
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => console.log('✅ Conectado al servidor');

socket.onmessage = (event) => {
  const datosRaw = JSON.parse(event.data);
  console.log('📡 Datos recibidos:', datosRaw);
  const datos = mapearDatos(datosRaw);
  actualizarDashboard(datos);
};

socket.onerror = (e) => console.error('❌ Error WebSocket:', e);

socket.onclose = () => {
  console.warn('⚠️ Conexión cerrada, reintentando en 3s...');
  setTimeout(() => location.reload(), 3000);
};