const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const wss = new WebSocket.Server({ port: 8080 });
console.log('✅ WebSocket escuchando en ws://localhost:8080');

const port = new SerialPort({ path: 'COM4', baudRate: 115200 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (linea) => {
  try {
    const datos = JSON.parse(linea);
    console.log('📡 Recibido del Pico:', datos);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(datos));
      }
    });
  } catch (e) {
    // Ignora líneas que no son JSON válido
  }
});

port.on('error', (err) => console.error('❌ Error Serial:', err.message));