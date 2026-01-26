"use client"

import { useState, useEffect, useCallback } from "react"
import { Chess, Square } from "chess.js"

interface StockfishChessProps {
  isDark: boolean
}

export default function StockfishChess({ isDark }: StockfishChessProps) {
  const [game, setGame] = useState<Chess | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [validMoves, setValidMoves] = useState<Square[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [gameStatus, setGameStatus] = useState("Your turn (White)")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium")
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)

  const pieces: Record<string, string> = {
    K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658", P: "\u2659",
    k: "\u265A", q: "\u265B", r: "\u265C", b: "\u265D", n: "\u265E", p: "\u265F",
  }

  const pieceValues: Record<string, number> = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
  }

  // Piece-square tables for positional evaluation
  const pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ]

  const knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ]

  const bishopTable = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ]

  const rookTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ]

  const queenTable = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ]

  const kingMiddleTable = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]

  const getPieceSquareValue = useCallback((piece: string, row: number, col: number, isWhite: boolean): number => {
    const r = isWhite ? row : 7 - row
    const type = piece.toLowerCase()
    
    switch (type) {
      case 'p': return pawnTable[r][col]
      case 'n': return knightTable[r][col]
      case 'b': return bishopTable[r][col]
      case 'r': return rookTable[r][col]
      case 'q': return queenTable[r][col]
      case 'k': return kingMiddleTable[r][col]
      default: return 0
    }
  }, [])

  const evaluateBoard = useCallback((g: Chess): number => {
    if (g.isCheckmate()) {
      return g.turn() === 'w' ? -Infinity : Infinity
    }
    if (g.isDraw()) return 0

    let score = 0
    const board = g.board()
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col]
        if (square) {
          const isWhite = square.color === 'w'
          const pieceValue = pieceValues[square.type] || 0
          const positionValue = getPieceSquareValue(square.type, row, col, isWhite)
          
          if (isWhite) {
            score -= pieceValue + positionValue
          } else {
            score += pieceValue + positionValue
          }
        }
      }
    }

    // Mobility bonus
    const moves = g.moves().length
    score += g.turn() === 'b' ? moves * 10 : -moves * 10

    return score
  }, [getPieceSquareValue])

  const minimax = useCallback((g: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number => {
    if (depth === 0 || g.isGameOver()) {
      return evaluateBoard(g)
    }

    const moves = g.moves()
    
    // Move ordering - check captures first
    moves.sort((a, b) => {
      const aCapture = a.includes('x') ? 1 : 0
      const bCapture = b.includes('x') ? 1 : 0
      return bCapture - aCapture
    })
    
    if (maximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newGame = new Chess(g.fen())
        newGame.move(move)
        const evalScore = minimax(newGame, depth - 1, alpha, beta, false)
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newGame = new Chess(g.fen())
        newGame.move(move)
        const evalScore = minimax(newGame, depth - 1, alpha, beta, true)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }, [evaluateBoard])

  const makeAIMove = useCallback((currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true })
    if (moves.length === 0) return

    const depthMap = { easy: 1, medium: 2, hard: 3, expert: 4 }
    const searchDepth = depthMap[difficulty]

    let bestMove = moves[0]
    let bestScore = -Infinity

    for (const move of moves) {
      const newGame = new Chess(currentGame.fen())
      newGame.move(move)
      const score = minimax(newGame, searchDepth - 1, -Infinity, Infinity, false)
      
      // Add slight randomness on easy mode
      const randomFactor = difficulty === 'easy' ? (Math.random() - 0.5) * 100 : 0
      
      if (score + randomFactor > bestScore) {
        bestScore = score + randomFactor
        bestMove = move
      }
    }

    const newGame = new Chess(currentGame.fen())
    newGame.move(bestMove)
    
    setLastMove({ from: bestMove.from as Square, to: bestMove.to as Square })
    
    if (newGame.isCheckmate()) {
      setGameStatus("Checkmate! You lose.")
    } else if (newGame.isDraw()) {
      setGameStatus("Draw!")
    } else if (newGame.isCheck()) {
      setGameStatus("Check! Your turn")
    } else {
      setGameStatus("Your turn (White)")
    }
    
    setGame(newGame)
    setIsThinking(false)
  }, [difficulty, minimax])

  useEffect(() => {
    setGame(new Chess())
  }, [])

  const handleSquareClick = (square: Square) => {
    if (!game || isThinking || game.isGameOver()) return

    const piece = game.get(square)
    
    if (piece && piece.color === "w") {
      setSelectedSquare(square)
      const moves = game.moves({ square, verbose: true })
      setValidMoves(moves.map(m => m.to as Square))
      return
    }

    if (selectedSquare && validMoves.includes(square)) {
      const newGame = new Chess(game.fen())
      
      const movingPiece = game.get(selectedSquare)
      const isPromotion = movingPiece?.type === "p" && 
        ((movingPiece.color === "w" && square[1] === "8") || 
         (movingPiece.color === "b" && square[1] === "1"))
      
      try {
        newGame.move({
          from: selectedSquare,
          to: square,
          promotion: isPromotion ? "q" : undefined
        })
        
        setLastMove({ from: selectedSquare, to: square })
        setGame(newGame)
        setSelectedSquare(null)
        setValidMoves([])
        
        if (newGame.isCheckmate()) {
          setGameStatus("Checkmate! You win!")
          return
        } else if (newGame.isDraw()) {
          setGameStatus("Draw!")
          return
        }
        
        setIsThinking(true)
        setGameStatus("Thinking...")
        
        setTimeout(() => makeAIMove(newGame), 100)
        
      } catch {
        setSelectedSquare(null)
        setValidMoves([])
      }
      return
    }

    setSelectedSquare(null)
    setValidMoves([])
  }

  const resetGame = () => {
    setGame(new Chess())
    setSelectedSquare(null)
    setValidMoves([])
    setIsThinking(false)
    setGameStatus("Your turn (White)")
    setLastMove(null)
  }

  const getBoardArray = (): (string | null)[][] => {
    if (!game) return Array(8).fill(null).map(() => Array(8).fill(null))
    
    const board: (string | null)[][] = []
    for (let rank = 8; rank >= 1; rank--) {
      const row: (string | null)[] = []
      for (let file = 0; file < 8; file++) {
        const square = (String.fromCharCode(97 + file) + rank) as Square
        const piece = game.get(square)
        if (piece) {
          row.push(piece.color === "w" ? piece.type.toUpperCase() : piece.type)
        } else {
          row.push(null)
        }
      }
      board.push(row)
    }
    return board
  }

  const squareToIndex = (row: number, col: number): Square => {
    return (String.fromCharCode(97 + col) + (8 - row)) as Square
  }

  const boardArray = getBoardArray()

  return (
    <div>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <p style={{ fontWeight: 600, color: "var(--text)" }}>{gameStatus}</p>
          {isThinking && (
            <div style={{
              width: "20px",
              height: "20px",
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "14px"
          }}>
            Difficulty:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              disabled={isThinking}
              style={{
                padding: "6px 12px",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
                cursor: "pointer"
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </label>
          <button
            onClick={resetGame}
            disabled={isThinking}
            style={{
              padding: "8px 16px",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: isThinking ? "not-allowed" : "pointer",
              opacity: isThinking ? 0.5 : 1
            }}
          >
            New Game
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        gap: "0",
        border: "3px solid var(--border)",
        borderRadius: "8px",
        overflow: "hidden",
        maxWidth: "480px"
      }}>
        {boardArray.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const square = squareToIndex(rowIndex, colIndex)
            const isSelected = selectedSquare === square
            const isValidMove = validMoves.includes(square)
            const isLight = (rowIndex + colIndex) % 2 === 0
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square)
            
            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                disabled={isThinking && !piece}
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  border: "none",
                  cursor: isThinking ? "wait" : "pointer",
                  background: isSelected 
                    ? "var(--accent)" 
                    : isValidMove 
                      ? "rgba(70, 124, 235, 0.4)" 
                      : isLastMoveSquare
                        ? (isDark ? "rgba(70, 124, 235, 0.25)" : "rgba(70, 124, 235, 0.2)")
                        : isLight 
                          ? (isDark ? "#2d2d3d" : "#f0f0f0")
                          : (isDark ? "#1a1a2e" : "#b0b0b0"),
                  transition: "background 0.1s",
                  position: "relative"
                }}
              >
                {piece && pieces[piece]}
                {isValidMove && !piece && (
                  <div style={{
                    position: "absolute",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "rgba(70, 124, 235, 0.5)"
                  }} />
                )}
              </button>
            )
          })
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
