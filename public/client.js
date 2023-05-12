const ws = new WebSocket('ws://localhost:8080');

let player;
let gameBoard;
let gameId;
let currentPlayer = null;
let gameInfo = document.querySelector('#game-info');

ws.onopen = () => {
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
      break;
    case 'end':
      gameInfo.textContent = data.message; // Show the winner message
      setTimeout(() => { // Add a delay to let the user read the message before redirecting
        window.location.href = '/leaderboard.html'; // Redirect to the leaderboard
      }, 3000);
      break;
    case 'error':
      console.error('Error: ' + data.message);
      break;
  }
};

function renderBoard() {
    let cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = gameBoard[index] !== null ? (gameBoard[index] === 0 ? 'X' : 'O') : '';
        cell.addEventListener('click', () => {
        if (gameBoard[index] === null && currentPlayer === player) {
            ws.send(JSON.stringify({ type: 'move', index: index, player: player, gameId: gameId, username: username }));
        }
        });
    });
}

document.querySelector('#join-btn').addEventListener('click', () => {
  let input = document.querySelector('#join-input');
  gameId = input.value;
  if (gameId) {
    ws.send(JSON.stringify({ type: 'join', gameId: gameId }));
  }
});
