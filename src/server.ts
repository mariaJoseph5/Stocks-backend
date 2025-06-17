import express from 'express';
import {WebSocketServer} from 'ws';
import {createServer} from 'http';
import {handleWebSocket} from './websocket/clientHandler.js';
import {startPricePolling} from './websocket/pricePoller.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({server});
wss.on('connection', (ws)=>{
    handleWebSocket(ws);
});
startPricePolling(wss);
const PORT = 3000;
server.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`)
});