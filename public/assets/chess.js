// This example uses the chess.js library:
// https://github.com/jhlywa/chess.js

// NOTE: the game object is separate from the board object
// the game object:
// - controls the state of the game
// - understands how pieces move and what moves are legal
// - knows who's turn it is
// - en passant, castling, draw logic, etc
const game = new Chess();

// the board object is "dumb":
// - shows the current position from the game
// - handles input events from users
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

// There are 5 outcomes from this action:
// - start a pending move
// - clear a pending move
// - clear a pending move AND start a different pending move
// - make a move (ie: complete their pending move)
// - do nothing
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
      promotion: "q", // always promote to a Queen for example simplicity
    });

    // was this a legal move?
    if (moveResult) {
      // clear circles on the board
      board.clearCircles();

      // update to the new position
      board.position(game.fen()).then(() => {
        updatePGN();
        updateStatus();

        // wait a smidge, then make a random move for Black
        window.setTimeout(makeRandomMove, 250);
      });

      // if the move was not legal, then start a new pendingMove from this square
    } else if (piece) {
      pendingMove = square;

      // remove any previous circles
      board.clearCircles();

      // add circles showing where the legal moves are for this piece
      legalMoves.forEach((m) => {
        board.addCircle(m.to);
      });

      // else clear pendingMove
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
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // only pick up pieces for White
  if (!isWhitePiece(dragStartEvt.piece)) return false;

  // what moves are available to White from this square?
  const legalMoves = game.moves({
    square: dragStartEvt.square,
    verbose: true,
  });

  // do nothing if there are no legal moves
  if (legalMoves.length === 0) return false;

  // place Circles on the possible target squares
  legalMoves.forEach((move) => {
    board.addCircle(move.to);
  });
}

function isWhitePiece(piece) {
  return /^w/.test(piece);
}

function makeRandomMove() {
  const possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) return;

  const randomIdx = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIdx]);
  board.position(game.fen(), (_positionInfo) => {
    updateStatus();
    updatePGN();
  });
}

function onDrop(dropEvt) {
  // see if the move is legal
  const move = game.move({
    from: dropEvt.source,
    to: dropEvt.target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // remove all Circles from the board
  board.clearCircles();

  // the move was legal
  if (move) {
    // reset the pending move
    pendingMove = null;

    // update the board position
    board.fen(game.fen(), () => {
      updateStatus();
      updatePGN();

      // make a random legal move for black
      window.setTimeout(makeRandomMove, 250);
    });
  } else {
    // reset the pending move
    pendingMove = null;

    // return the piece to the source square if the move was illegal
    return "snapback";
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}
