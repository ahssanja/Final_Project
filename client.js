// client.js
const ws = new WebSocket('ws://localhost:8080');

let player;
let gameBoard;
let gameId;
let currentPlayer = null;
let gameInfo = document.querySelector('#game-info');

ws.onopen = () => {
    // Create a new game
    ws.send(JSON.stringify({ type: 'create' }));
};

ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    switch (data.type) {
        case 'created':
            gameId = data.gameId;
            gameInfo.textContent = 'Game created with ID: ' + gameId;
            break;
        case 'start':
            player = data.player;
            gameBoard = data.board;
            currentPlayer = data.currentPlayer;
            gameInfo.textContent = 'Game started. You are player: ' + player;
            renderBoard();
            break;
        case 'move':
            gameBoard = data.board;
            currentPlayer = data.currentPlayer;
            renderBoard();
            if (checkWinner(gameBoard)) {
                gameInfo.textContent = 'Player ' + (1 - currentPlayer) + ' wins!';
            }
            break;
        case 'error':
            console.error('Error: ' + data.message);
            break;
    }
};

// client.js
ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    switch (data.type) {
        case 'created':
            gameId = data.gameId;
            gameInfo.textContent = 'Game created with ID: ' + gameId;
            break;
        case 'start':
            player = data.player;
            gameBoard = data.board;
            currentPlayer = data.currentPlayer;
            gameInfo.textContent = 'Game started. You are player: ' + player;
            renderBoard();
            break;
        case 'move':
            gameBoard = data.board;
            currentPlayer = data.currentPlayer;
            renderBoard();
            if (data.winner) {
                gameInfo.textContent = 'Player ' + (1 - currentPlayer) + ' wins!';
            }
            break;
        case 'error':
            console.error('Error: ' + data.message);
            break;
    }
};


function renderBoard() {
    let gameDiv = document.querySelector('#game-board');
    gameDiv.innerHTML = '';
    gameBoard.forEach((cell, index) => {
        let cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.dataset.index = index;
        cellDiv.textContent = cell === 0 ? 'X' : cell === 1 ? 'O' : '';
        cellDiv.addEventListener('click', onCellClick);
        gameDiv.appendChild(cellDiv);
    });
}

function onCellClick(event) {
    let cellIndex = event.target.dataset.index;
    if (gameBoard[cellIndex] === null && currentPlayer === player) {
        ws.send(JSON.stringify({
            type: 'move',
            gameId: gameId,
            player: player,
            index: parseInt(cellIndex)
        }));
    }
}

document.getElementById('join').addEventListener('click', () => {
    let gameId = document.getElementById('gameId').value;
    if (gameId) {
        ws.send(JSON.stringify({ type: 'join', gameId: gameId }));
    }
});

function checkWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let line of lines) {
        if (board[line[0]] !== null &&
            board[line[0]] === board[line[1]] &&
            board[line[0]] === board[line[2]]) {
            return true;
        }
    }
    return false;
}
