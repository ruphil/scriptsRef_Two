import express from 'express';
import http from 'http';
import ws from 'ws';
import path from 'path';

import { handleWebSocketConnection } from './wshandler';

const staticDir = path.join(__dirname, 'frontend');
const app = express();
app.use(express.static(staticDir));
app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

const server = http.createServer(app);
const wss = new ws.Server({ server });
wss.on('connection', (ws) => {
    handleWebSocketConnection(ws);
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});