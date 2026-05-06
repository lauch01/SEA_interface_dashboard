const WebSocket = require("ws");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const PORT_COM = "COM4"; // CAMBIA ESTO
const BAUDRATE = 115200;

const wss = new WebSocket.Server({ port: 8080 });

console.log("✅ WebSocket escuchando en ws://localhost:8080");

const port = new SerialPort({
  path: PORT_COM,
  baudRate: BAUDRATE
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

port.on("open", () => {
  console.log("✅ Puerto serial abierto:", PORT_COM);
});

port.on("error", (err) => {
  console.error("❌ Error serial:", err.message);
});

parser.on("data", (line) => {
  console.log("RAW:", line);

  try {
    const jsonData = JSON.parse(line.trim());

    console.log("✅ JSON recibido:", jsonData);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(jsonData));
      }
    });

    console.log("📤 Enviado al dashboard");

  } catch (err) {
    console.log("⚠️ No es JSON válido:", line);
  }
});