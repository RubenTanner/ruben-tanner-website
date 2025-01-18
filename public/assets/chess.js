const game = new Chess();

const boardConfig = {
  draggable: true,
  onDragStart,
  onTouchSquare,
  onDrop,
  onSnapEnd,
  position: game.fen(),
  touchMove: true,
};
const board = Chessboard2("myBoard", boardConfig);

updateStatus();
let pendingMove = null;

function onTouchSquare(square, piece, boardInfo) {
  // ask chess.js what legal moves are available from this square
  const legalMoves = game.moves({ square, verbose: true });

  // Option 1: start a pending move
  if (!pendingMove && legalMoves.length > 0) {
    pendingMove = square;

    // add circles showing where the legal moves are for this piece
    legalMoves.forEach((move) => {
      board.addCircle(move.to);
    });

    // Option 2: clear a pending move if the user selects the same square twice
  } else if (pendingMove && pendingMove === square) {
    pendingMove = null;
    board.clearCircles();

    // Option 3: clear a pending move and start a new pending move
  } else if (pendingMove) {
    // ask chess.js to make a move
    const moveResult = game.move({
      from: pendingMove,
      to: square,
      promotion: "q", //promote to queen as its easier
    });

    if (moveResult) {
      board.clearCircles();

      // update to the new position
      board.position(game.fen()).then(() => {
        updatePGN();
        updateStatus();

        // wait a mo', then make a random move for Black
        window.setTimeout(makeRandomMove, 250);
      });
    } else if (piece) {
      pendingMove = square;

      board.clearCircles();

      legalMoves.forEach((m) => {
        board.addCircle(m.to);
      });
    } else {
      pendingMove = null;
      board.clearCircles();
    }
  }
}

function updateStatus() {
  let statusHTML = "";
  const whosTurn = game.turn() === "w" ? "White" : "Black";

  if (!game.game_over()) {
    if (game.in_check()) statusHTML = whosTurn + " is in check! ";
    statusHTML = statusHTML + whosTurn + " to move.";
  } else if (game.in_checkmate() && game.turn() === "w") {
    statusHTML = "Game over: white is in checkmate. Black wins!";
  } else if (game.in_checkmate() && game.turn() === "b") {
    statusHTML = "Game over: black is in checkmate. White wins!";
  } else if (game.in_stalemate() && game.turn() === "w") {
    statusHTML = "Game is drawn. White is stalemated.";
  } else if (game.in_stalemate() && game.turn() === "b") {
    statusHTML = "Game is drawn. Black is stalemated.";
  } else if (game.in_threefold_repetition()) {
    statusHTML = "Game is drawn by threefold repetition rule.";
  } else if (game.insufficient_material()) {
    statusHTML = "Game is drawn by insufficient material.";
  } else if (game.in_draw()) {
    statusHTML = "Game is drawn by fifty-move rule.";
  }

  document.getElementById("gameStatus").innerHTML = statusHTML;
}

function updatePGN() {
  const pgnEl = document.getElementById("gamePGN");
  pgnEl.innerHTML = game.pgn({ max_width: 5, newline_char: "<br />" });
}

function onDragStart(dragStartEvt) {
  if (game.game_over()) return false;

  if (!isWhitePiece(dragStartEvt.piece)) return false;

  const legalMoves = game.moves({
    square: dragStartEvt.square,
    verbose: true,
  });

  if (legalMoves.length === 0) return false;

  legalMoves.forEach((move) => {
    board.addCircle(move.to);
  });
}

function isWhitePiece(piece) {
  return /^w/.test(piece);
}

function makeRandomMove() {
  const possibleMoves = game.moves();

  if (possibleMoves.length === 0) return;

  const randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen(), (_positionInfo) => {
    updateStatus();
    updatePGN();
  });
}

function onDrop(dropEvt) {
  const move = game.move({
    from: dropEvt.source,
    to: dropEvt.target,
    promotion: "q",
  });

  board.clearCircles();

  if (move) {
    pendingMove = null;

    board.fen(game.fen(), () => {
      updateStatus();
      updatePGN();

      window.setTimeout(makeRandomMove, 250);
    });
  } else {
    pendingMove = null;

    return "snapback";
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}
