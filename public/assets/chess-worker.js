// Engine: minimax with alpha-beta, piece values, piece-square tables and a
// small mobility term. Runs in a Web Worker so the page never freezes.
// Ported from the January 2026 React version; the search uses move/undo
// instead of copying the position at every node.

import { Chess, Move } from "/assets/vendor/chess.js";

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const TABLES = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

// Positive is good for black (the engine); negative is good for white.
//
// The search uses chess.js's internal _moves / _makeMove / _undoMove and its
// 0x88 board array rather than the public move()/undo(), because the public
// path generates SAN and re-validates on every call, which made depth 3
// take seconds. The vendored copy is pinned, so the internals are stable.

function evaluate(game) {
  let score = 0;
  const board = game._board; // 0x88: index 0 is a8, row = i >> 4, col = i & 7
  for (let i = 0; i < 120; i++) {
    if (i & 0x88) {
      i += 7;
      continue;
    }
    const sq = board[i];
    if (!sq) continue;
    const white = sq.color === "w";
    const row = i >> 4;
    const r = white ? row : 7 - row;
    const value = VALUES[sq.type] + TABLES[sq.type][r][i & 7];
    score += white ? -value : value;
  }
  return score;
}

// Captures first, most valuable victim first. Cheap and it helps alpha-beta a lot.
function ordered(game) {
  const moves = game._moves({ legal: true });
  moves.sort(
    (a, b) =>
      (b.captured ? VALUES[b.captured] : 0) -
      (a.captured ? VALUES[a.captured] : 0),
  );
  return moves;
}

class OutOfTime extends Error {}

let deadline = 0;
let nodes = 0;

function minimax(game, depth, alpha, beta, maximising) {
  nodes += 1;
  if ((nodes & 31) === 0 && performance.now() > deadline) throw new OutOfTime();

  const moves = ordered(game);
  if (moves.length === 0) {
    if (!game.isCheck()) return 0; // stalemate
    return maximising ? -100000 - depth : 100000 + depth; // mated: worse the sooner
  }
  if (depth === 0) return evaluate(game);

  if (maximising) {
    let best = -Infinity;
    for (const m of moves) {
      game._makeMove(m);
      try {
        best = Math.max(best, minimax(game, depth - 1, alpha, beta, false));
      } finally {
        game._undoMove(); // also runs when OutOfTime unwinds, so the position is never left corrupted
      }
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    game._makeMove(m);
    try {
      best = Math.min(best, minimax(game, depth - 1, alpha, beta, true));
    } finally {
      game._undoMove();
    }
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function searchDepth(game, depth, randomness) {
  const moves = ordered(game);
  let bestMove = moves[0];
  let bestScore = -Infinity;
  for (const m of moves) {
    game._makeMove(m);
    let score;
    try {
      score = minimax(game, depth - 1, -Infinity, Infinity, false);
    } finally {
      game._undoMove();
    }
    if (randomness) score += (Math.random() - 0.5) * randomness;
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }
  return bestMove;
}

// Iterative deepening with a time budget: search depth 1, then 2, and so on
// up to maxDepth. If the budget runs out mid-way, the last completed depth's
// move is used, so the engine always answers in roughly budgetMs.
function chooseMove(fen, maxDepth, budgetMs) {
  const game = new Chess(fen);
  if (game._moves({ legal: true }).length === 0) return null;

  const start = performance.now();
  nodes = 0;
  const randomness = maxDepth === 1 ? 100 : 0; // Easy: a bit scatty on purpose
  let best = null;
  let reached = 0;
  for (let depth = 1; depth <= maxDepth; depth++) {
    // Depth 1 always completes so there is always a move to play.
    deadline = depth === 1 ? Infinity : start + budgetMs;
    try {
      best = searchDepth(game, depth, randomness);
      reached = depth;
    } catch (e) {
      if (e instanceof OutOfTime) break;
      throw e;
    }
  }
  if (!best) return null;
  return {
    san: new Move(game, best).san,
    depth: reached,
    nodes,
    ms: Math.round(performance.now() - start),
  };
}

self.onmessage = (e) => {
  const { id, fen, depth, budgetMs } = e.data;
  const result = chooseMove(fen, depth, budgetMs || 2000);
  self.postMessage({
    id,
    san: result ? result.san : null,
    depth: result ? result.depth : 0,
    nodes: result ? result.nodes : 0,
    ms: result ? result.ms : 0,
  });
};
