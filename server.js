// server.js
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Send the clint.js
app.get('/client.js', (req, res) => {
    const filePath = path.join(__dirname, 'client.js');
    res.sendFile(filePath)
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'create':
                let gameId = uuidv4();
                games[gameId] = {
                    id: gameId,
                    players: [ws],
                    board: Array(9).fill(null),
                    currentPlayer: 0
                };
                ws.send(JSON.stringify({ type: 'created', gameId: gameId }));
                break;
            case 'join':
                let game = games[data.gameId];
                if (game && game.players.length < 2) {
                    game.players.push(ws);
                    game.players.forEach((ws, index) => ws.send(JSON.stringify({
                        type: 'start',
                        player: index,
                        board: game.board,
                        currentPlayer: game.currentPlayer
                    })));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Cannot join game' }));
                }
                break;
            case 'move':
                let currentGame = games[data.gameId];
                if (currentGame && currentGame.board[data.index] === null) {
                    currentGame.board[data.index] = data.player;
                    currentGame.currentPlayer = (currentGame.currentPlayer + 1) % 2;
                    currentGame.players.forEach((ws) => ws.send(JSON.stringify({
                        type: 'move',
                        board: currentGame.board,
                        currentPlayer: currentGame.currentPlayer
                    })));
                }
                break;
        }
    });
});

// server.js
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'create':
                let gameId = uuidv4();
                games[gameId] = {
                    id: gameId,
                    players: [ws],
                    board: Array(9).fill(null),
                    currentPlayer: 0
                };
                ws.send(JSON.stringify({ type: 'created', gameId: gameId }));
                break;
            case 'join':
                let game = games[data.gameId];
                if (game && game.players.length < 2) {
                    game.players.push(ws);
                    game.players.forEach((ws, index) => ws.send(JSON.stringify({
                        type: 'start',
                        player: index,
                        board: game.board,
                        currentPlayer: game.currentPlayer
                    })));
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Cannot join game' }));
                }
                break;
            case 'move':
                let currentGame = games[data.gameId];
                if (currentGame && currentGame.board[data.index] === null && currentGame.currentPlayer === data.player) {
                    currentGame.board[data.index] = data.player;
                    currentGame.currentPlayer = (currentGame.currentPlayer + 1) % 2;
                    currentGame.players.forEach((ws) => ws.send(JSON.stringify({
                        type: 'move',
                        board: currentGame.board,
                        currentPlayer: currentGame.currentPlayer,
                        winner: checkWinner(currentGame.board)
                    })));
                }
                break;
        }
    });
});


server.listen(8080, () => console.log('Server started on port 8080'));