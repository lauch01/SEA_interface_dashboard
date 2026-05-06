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
    ui.uv.innerText = datos.uv ?? "N/A";

    ui.bmeTemp.innerText = datos.bme_temp != null ? datos.bme_temp.toFixed(1) : "N/A";
    ui.bmePres.innerText = datos.bme_pres != null ? datos.bme_pres.toFixed(1) : "N/A";
    ui.bmeHum.innerText = datos.bme_hum != null ? datos.bme_hum.toFixed(1) : "N/A";

    ui.dhtTemp.innerText = datos.dht_temp != null ? datos.dht_temp.toFixed(1) : "N/A";
    ui.dhtHum.innerText = datos.dht_hum != null ? datos.dht_hum.toFixed(1) : "N/A";

    ui.gpsLat.innerText = datos.gps_lat != null ? datos.gps_lat.toFixed(6) : "N/A";
    ui.gpsLon.innerText = datos.gps_lon != null ? datos.gps_lon.toFixed(6) : "N/A";
    ui.gpsAlt.innerText = datos.gps_alt != null ? datos.gps_alt.toFixed(1) : "N/A";
    ui.gpsSats.innerText = datos.gps_sats ?? "N/A";
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