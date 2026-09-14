// Board UI. Loaded on demand from site.js; the engine lives in chess-worker.js.

import { Chess } from "/assets/vendor/chess.js";

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const NAME = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
const FILES = "abcdefgh";
const LEVELS = {
  easy: { depth: 1, budgetMs: 500 },
  medium: { depth: 2, budgetMs: 1500 },
  hard: { depth: 3, budgetMs: 3000 },
  harder: { depth: 4, budgetMs: 6000 },
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

export function mount(container) {
  const game = new Chess();
  const worker = new Worker("/assets/chess-worker.js", { type: "module" });

  let selected = null;
  let targets = [];
  let last = null;
  let thinking = false;
  let job = 0;

  // Squares in display order: rank 8 down to 1, file a to h.
  const squares = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let f = 0; f < 8; f++) squares.push(FILES[f] + rank);
  }

  const board = el("div", { class: "board", role: "group", "aria-label": "Chess board. You play white." });
  const buttons = new Map();
  squares.forEach((sq, i) => {
    const light = (FILES.indexOf(sq[0]) + Number(sq[1])) % 2 === 1;
    const b = el("button", { type: "button", class: `sq ${light ? "sq-light" : "sq-dark"}`, "data-square": sq, "data-index": String(i) });
    b.addEventListener("click", () => onSquare(sq));
    board.append(b);
    buttons.set(sq, b);
  });
  board.addEventListener("keydown", onArrow);

  const status = el("p", { class: "chess-status", role: "status", "aria-live": "polite" });
  const level = el("select", { id: "chess-level", "aria-label": "Difficulty" }, [
    el("option", { value: "easy", text: "Easy" }),
    el("option", { value: "medium", text: "Medium", selected: "" }),
    el("option", { value: "hard", text: "Hard" }),
    el("option", { value: "harder", text: "Harder, and slower" }),
  ]);
  const reset = el("button", { type: "button", class: "button-quiet", text: "New game" });
  reset.addEventListener("click", newGame);
  const moves = el("ol", { class: "moves", "aria-label": "Moves so far" });

  const side = el("div", { class: "chess-side" }, [
    status,
    el("div", { class: "chess-controls" }, [el("label", { for: "chess-level", text: "Difficulty" }), level, reset]),
    moves,
  ]);

  container.replaceChildren(el("div", { class: "chess" }, [board, side]));
  render();
  buttons.get("e2").focus();

  worker.onmessage = (e) => {
    const { id, san } = e.data;
    if (id !== job) return; // a stale reply after "New game"
    thinking = false;
    container.dataset.engine = `depth ${e.data.depth}, ${e.data.nodes} nodes, ${e.data.ms} ms`;
    if (san) {
      const m = game.move(san);
      last = { from: m.from, to: m.to };
    }
    render();
  };
  worker.onerror = () => {
    thinking = false;
    status.textContent = "The engine crashed. Press New game to try again.";
  };

  function onSquare(sq) {
    if (thinking || game.isGameOver()) return;

    if (selected && targets.includes(sq)) {
      const m = game.move({ from: selected, to: sq, promotion: "q" });
      last = { from: m.from, to: m.to };
      selected = null;
      targets = [];
      render();
      if (!game.isGameOver()) engineMove();
      return;
    }

    const piece = game.get(sq);
    if (piece && piece.color === "w") {
      selected = sq;
      targets = game.moves({ square: sq, verbose: true }).map((m) => m.to);
    } else {
      selected = null;
      targets = [];
    }
    render();
  }

  function engineMove() {
    thinking = true;
    job += 1;
    render();
    const l = LEVELS[level.value] || LEVELS.medium;
    worker.postMessage({ id: job, fen: game.fen(), depth: l.depth, budgetMs: l.budgetMs });
  }

  function newGame() {
    job += 1;
    game.reset();
    selected = null;
    targets = [];
    last = null;
    thinking = false;
    render();
    buttons.get("e2").focus();
  }

  function onArrow(e) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[e.key];
    if (step === undefined || !e.target.dataset.index) return;
    const i = Number(e.target.dataset.index) + step;
    if (i < 0 || i > 63) return;
    if ((e.key === "ArrowLeft" && i % 8 === 7) || (e.key === "ArrowRight" && i % 8 === 0)) return;
    e.preventDefault();
    board.children[i].focus();
  }

  function statusText() {
    if (game.isCheckmate()) return game.turn() === "w" ? "Checkmate. Black wins." : "Checkmate. You win.";
    if (game.isStalemate()) return "Draw by stalemate.";
    if (game.isThreefoldRepetition()) return "Draw by repetition.";
    if (game.isInsufficientMaterial()) return "Draw. Not enough material left.";
    if (game.isDraw()) return "Draw by the fifty-move rule.";
    if (thinking) return "Thinking…";
    if (game.isCheck()) return "Check. Your move.";
    return "Your move.";
  }

  function render() {
    const inCheck = game.isCheck();
    for (const sq of squares) {
      const b = buttons.get(sq);
      const piece = game.get(sq);
      b.className = b.className.replace(/\s*(sq-sel|sq-target|sq-last|sq-check|sq-piece)/g, "");
      if (piece) {
        const span = el("span", { class: piece.color === "w" ? "p-w" : "p-b", text: GLYPH[piece.type], "aria-hidden": "true" });
        b.replaceChildren(span);
        b.classList.add("sq-piece");
        b.setAttribute("aria-label", `${sq}, ${piece.color === "w" ? "white" : "black"} ${NAME[piece.type]}`);
        if (inCheck && piece.type === "k" && piece.color === game.turn()) b.classList.add("sq-check");
      } else {
        b.replaceChildren();
        b.setAttribute("aria-label", `${sq}, empty`);
      }
      if (sq === selected) b.classList.add("sq-sel");
      if (targets.includes(sq)) b.classList.add("sq-target");
      if (last && (sq === last.from || sq === last.to)) b.classList.add("sq-last");
      b.setAttribute("aria-pressed", sq === selected ? "true" : "false");
    }

    status.textContent = statusText();
    level.disabled = thinking;

    const history = game.history();
    const rows = [];
    for (let i = 0; i < history.length; i += 2) {
      rows.push(el("li", { text: history[i] + (history[i + 1] ? " " + history[i + 1] : "") }));
    }
    moves.replaceChildren(...rows);
  }
}
