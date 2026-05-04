// Referencias a los elementos del DOM (la pantalla)
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

// Función para actualizar la interfaz con datos nuevos
function actualizarDashboard(datos) {
    ui.tempInt.innerText = `${datos.tempInt.toFixed(1)} °C`;
    ui.tempExt.innerText = `${datos.tempExt.toFixed(1)} °C`;
    ui.presion.innerText = `${datos.presion.toFixed(1)} hPa`;
    ui.luz.innerText = `${Math.round(datos.luz)} Lux`;
    
    // Formatear Brújula
    let direccion = "N";
    if (datos.brujula > 45 && datos.brujula <= 135) direccion = "E";
    else if (datos.brujula > 135 && datos.brujula <= 225) direccion = "S";
    else if (datos.brujula > 225 && datos.brujula <= 315) direccion = "O";
    ui.brujula.innerText = `${Math.round(datos.brujula)}° ${direccion}`;

    ui.gpsLat.innerText = datos.gpsLat.toFixed(6);
    ui.gpsLon.innerText = datos.gpsLon.toFixed(6);
    
    ui.batVolt.innerText = `${datos.batVolt.toFixed(1)} V`;
    ui.batCurr.innerText = `${datos.batCurr.toFixed(1)} A`;

    // Alerta visual simple si el voltaje cae
    if (datos.batVolt < 10.5) {
        ui.batVolt.classList.add('alert-text');
    } else {
        ui.batVolt.classList.remove('alert-text');
    }
}

// ---------------------------------------------------------
// SIMULACIÓN (Para probar la interfaz)
// ---------------------------------------------------------
let datosSimulados = {
    tempInt: 22.0, tempExt: 14.5, presion: 740.0, luz: 450,
    brujula: 245, gpsLat: -20.1338, gpsLon: -67.4891,
    batVolt: 11.4, batCurr: 2.1
};

setInterval(() => {
    // Añadir un poco de ruido para simular sensores reales
    datosSimulados.tempInt += (Math.random() - 0.5) * 0.2;
    datosSimulados.luz += (Math.random() - 0.5) * 10;
    datosSimulados.brujula = (datosSimulados.brujula + (Math.random() - 0.5) * 2) % 360;
    if (datosSimulados.brujula < 0) datosSimulados.brujula += 360;
    
    actualizarDashboard(datosSimulados);
}, 1000); // Actualiza cada segundo


function toggleStatus(id) {
    const element = document.getElementById(id);
    const button = element.querySelector(".toggle-btn");

    if (element.classList.contains("go")) {
        element.classList.remove("go");
        element.classList.add("no-go");
        button.textContent = "NO GO";
    } else {
        element.classList.remove("no-go");
        element.classList.add("go");
        button.textContent = "GO";
    }
}

function toggleConfirm(button) {
    button.classList.toggle("active");
}
// ---------------------------------------------------------
// INTEGRACIÓN REAL (Para cuando conectes el hardware)
// ---------------------------------------------------------
/* Para un sistema teleoperado donde tienes una Jetson conectada a una Raspberry, 
el flujo ideal es:
1. Tu programa en la Jetson/Raspberry lee los sensores (I2C, UART, etc.).
2. Ese programa envía un JSON con los datos por un WebSockets a esta página.
3. El código aquí recibe el JSON y llama a 'actualizarDashboard()'.

Ejemplo de código para recibir datos reales:

const socket = new WebSocket('ws://IP_DE_LA_JETSON:8080');
socket.onmessage = function(event) {
    const datosReales = JSON.parse(event.data);
    actualizarDashboard(datosReales);
};
*/