const ui = {
    uv: document.getElementById("uv"),
    uvBar: document.getElementById("uv-bar"),

    bmeTemp: document.getElementById("bme-temp"),
    bmeTempBar: document.getElementById("bme-temp-bar"),

    bmePres: document.getElementById("bme-pres"),
    bmePresBar: document.getElementById("bme-pres-bar"),

    bmeHum: document.getElementById("bme-hum"),
    bmeHumBar: document.getElementById("bme-hum-bar"),

    dhtTemp: document.getElementById("dht-temp"),
    dhtTempBar: document.getElementById("dht-temp-bar"),

    dhtHum: document.getElementById("dht-hum"),
    dhtHumBar: document.getElementById("dht-hum-bar"),

    gpsLat: document.getElementById("gps-lat"),
    gpsLon: document.getElementById("gps-lon"),
    gpsAlt: document.getElementById("gps-alt"),
    gpsSats: document.getElementById("gps-sats"),
    gpsTime: document.getElementById("gps-time")
};

function safeValue(value, decimals = 1, unit = "") {
    if (value === null || value === undefined || isNaN(value)) {
        return "N/A";
    }
    return `${Number(value).toFixed(decimals)} ${unit}`;
}

function updateBar(bar, value, min, max) {
    if (!bar || value === null || value === undefined || isNaN(value)) {
        bar.style.width = "0%";
        return;
    }

    let percent = ((value - min) / (max - min)) * 100;
    percent = Math.max(0, Math.min(100, percent));

    bar.style.width = `${percent}%`;
}

function actualizarDashboard(datos) {
    // LTR-390
    ui.uv.innerText = datos.uv !== null ? `${datos.uv} UV index` : "N/A";
    updateBar(ui.uvBar, datos.uv, 0, 100);

    // BME280
    ui.bmeTemp.innerText = safeValue(datos.bme_temp, 1, "°C");
    updateBar(ui.bmeTempBar, datos.bme_temp, -10, 50);

    ui.bmePres.innerText = safeValue(datos.bme_pres, 1, "hPa");
    updateBar(ui.bmePresBar, datos.bme_pres, 600, 800);

    ui.bmeHum.innerText = safeValue(datos.bme_hum, 1, "%");
    updateBar(ui.bmeHumBar, datos.bme_hum, 0, 100);

    // DHT11
    ui.dhtTemp.innerText = safeValue(datos.dht_temp, 1, "°C");
    updateBar(ui.dhtTempBar, datos.dht_temp, -10, 50);

    ui.dhtHum.innerText = safeValue(datos.dht_hum, 1, "%");
    updateBar(ui.dhtHumBar, datos.dht_hum, 0, 100);

    // GPS
    ui.gpsLat.innerText = datos.gps_lat !== null ? datos.gps_lat.toFixed(6) : "N/A";
    ui.gpsLon.innerText = datos.gps_lon !== null ? datos.gps_lon.toFixed(6) : "N/A";
    ui.gpsAlt.innerText = safeValue(datos.gps_alt, 1, "m");
    ui.gpsSats.innerText = datos.gps_sats !== null ? `${datos.gps_sats}` : "N/A";
    ui.gpsTime.innerText = datos.gps_time ?? "N/A";
}

// WebSocket
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("✅ Conectado al servidor WebSocket");
};

socket.onmessage = (event) => {
    try {
        const datos = JSON.parse(event.data);
        console.log("📡 Datos recibidos:", datos);
        actualizarDashboard(datos);
    } catch (error) {
        console.error("❌ Error al leer JSON:", error);
    }
};

socket.onerror = (error) => {
    console.error("❌ Error WebSocket:", error);
};

socket.onclose = () => {
    console.warn("⚠️ WebSocket cerrado");
};