// Funciones para los botones de comando
function startExploration() {
    console.log("Comando enviado: START EXPLORATION");
    alert("Exploration mode activated. Initializing sensors...");
}

function takePhoto() {
    console.log("Comando enviado: TAKE PHOTOGRAPH");
    // Aquí puedes agregar un efecto de flash en la cámara
}

function takeData() {
    console.log("Comando enviado: LOG DATA");
}

function activateSoil() {
    console.log("Comando enviado: SOIL SENSOR ACTIVATION");
    alert("Deploying Soil Sensor...");
}

function deployExcavation() {
    console.log("Comando enviado: EXCAVATION PAYLOAD");
    alert("Excavation mechanism engaged.");
}

// Simulación de fluctuación de telemetría
setInterval(() => {
    // Variar el voltaje ligeramente
    let baseVoltage = 28.1;
    let fluctV = (Math.random() * 0.2 - 0.1).toFixed(2);
    document.getElementById('battery-voltage').innerText = (baseVoltage + parseFloat(fluctV)).toFixed(1) + "V";

    // Variar la corriente
    let baseCurrent = 14.5;
    let fluctC = (Math.random() * 0.5 - 0.25).toFixed(2);
    document.getElementById('battery-current').innerText = (baseCurrent + parseFloat(fluctC)).toFixed(1) + " A";

    // Variar luminosidad
    let baseLux = 12500;
    let fluctL = Math.floor(Math.random() * 100 - 50);
    document.getElementById('luminosity').innerText = (baseLux + fluctL) + " LUX";

}, 2000); // Se actualiza cada 2 segundos