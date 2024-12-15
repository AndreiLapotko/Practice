const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Ошибка сервера!');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Страница не найдена!');
  }
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws) => {
  console.log(`Клиент подключен!`);

  ws.on('message', (message) => {
    console.log(`Получено сообщение: ${message}`);
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'register') {
      clients.set(ws, parsedMessage.username);
      ws.send(JSON.stringify({type: 'welcome', message: `Привет, ${parsedMessage.username}! Добро пожаловать в чат!`}));
      return;
    }

    const username = clients.get(ws) || 'Неизвестный';

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: 'message', username, message: parsedMessage.message}));
      }
    });
  });

  ws.on('close', () => {
    console.log('Клиент отключен!');
  });
});

server.listen(8080, () => {
  console.log('Сервер запущен на порту 8080');
});