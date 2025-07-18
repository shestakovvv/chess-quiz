<template>
  <div class="">
    <div class="text-center my-4 text-lg font-semibold text-white min-h-12">
      {{ message }}
    </div>

    <div ref="boardEl" class="aspect-square border border-gray-300 mx-auto"></div>

    <div class="flex justify-center gap-4 mt-4">
      <button @click="resetGame" class="bg-blue-600 text-white px-4 py-2 rounded">Reset</button>
      <button @click="undoMove" class="bg-gray-700 text-white px-4 py-2 rounded">Undo</button>
    </div>

    <div class="mt-6 text-center">
      <pre
        class="bg-gray-800 text-white p-4 rounded w-full max-w-md mx-auto overflow-x-auto min-h-14"
        >{{ movesOnly }}</pre
      >
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { Chess } from 'chess.js'
import { Chessground } from 'chessground'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'

const boardEl = ref()
const pgn = ref('')
const message = ref('')
const fenStart = 'r3rk2/pbpq1p2/3b1Q1p/np2p3/4P2N/1BP4P/PP3PP1/3RR1K1 w - - 0 1'
const chess = new Chess(fenStart)
const solution = ['Ng6+', 'Qh8#']
let board = null
let moveIndex = 0

const movesOnly = computed(() =>
  pgn.value != null
    ? pgn.value
        .split('\n')
        .filter((line) => !line.startsWith('[') && line.trim() !== '')
        .join(' ')
        .replace(/\d+\.\s*/g, '')
        .replace(/\s*\*\s*$/, '')
        .trim()
    : '',
)

function computeDests() {
  const dests = new Map()
  const squares = chess.SQUARES || [
    'a1',
    'b1',
    'c1',
    'd1',
    'e1',
    'f1',
    'g1',
    'h1',
    'a2',
    'b2',
    'c2',
    'd2',
    'e2',
    'f2',
    'g2',
    'h2',
    'a3',
    'b3',
    'c3',
    'd3',
    'e3',
    'f3',
    'g3',
    'h3',
    'a4',
    'b4',
    'c4',
    'd4',
    'e4',
    'f4',
    'g4',
    'h4',
    'a5',
    'b5',
    'c5',
    'd5',
    'e5',
    'f5',
    'g5',
    'h5',
    'a6',
    'b6',
    'c6',
    'd6',
    'e6',
    'f6',
    'g6',
    'h6',
    'a7',
    'b7',
    'c7',
    'd7',
    'e7',
    'f7',
    'g7',
    'h7',
    'a8',
    'b8',
    'c8',
    'd8',
    'e8',
    'f8',
    'g8',
    'h8',
  ]
  for (const square of squares) {
    const moves = chess.moves({ square, verbose: true })
    if (moves.length) {
      dests.set(
        square,
        moves.map((m) => m.to),
      )
    }
  }
  return dests
}

function updateBoard() {
  board.set({
    fen: chess.fen(),
    turnColor: chess.turn() === 'w' ? 'white' : 'black',
    movable: {
      free: false,
      dests: computeDests(),
      color: chess.turn() === 'w' ? 'white' : 'black',
      events: {
        after: (from, to) => after_move(from, to),
      },
    },
  })
  pgn.value = chess.pgn()
}

function after_move(from, to) {
  const move = chess.move({ from, to, promotion: 'q' })

  if (!move) return

  const san = move.san.replace(/[+#]/g, '')
  const expected = solution[moveIndex].replace(/[+#]/g, '')

  if (san !== expected) {
    message.value = `❌ Неправильно!`
    board.cancelMove?.()
    chess.undo()
    updateBoard()
    return
  }

  if (san === 'Ng6') {
    message.value = ''
    // Блокируем доску
    board.set({ movable: { color: 'none', dests: new Map() } })

    // Ответ черных
    setTimeout(() => {
      chess.move({ from: 'f8', to: 'g8' }) // Kg8
      moveIndex++
      updateBoard()
    }, 300)
  } else {
    moveIndex++
    updateBoard()
    if (moveIndex === solution.length) {
      setTimeout(() => {
        message.value = '✅ Все верно! Мат!🎉'
      }, 200)
    }
  }
}

function resetGame() {
  message.value = ''
  chess.reset()
  chess.load(fenStart)
  moveIndex = 0
  updateBoard()
}

function undoMove() {
  message.value = ''
  board.cancelMove?.()
  chess.undo()
  moveIndex = Math.max(0, moveIndex - 1)
  updateBoard()
}

onMounted(() => {
  board = Chessground(boardEl.value, {
    fen: chess.fen(),
    movable: {
      free: false,
      dests: computeDests(),
      color: 'white',
      events: {
        after: (from, to) => after_move(from, to),
      },
    },
  })
  pgn.value = chess.pgn()
})
</script>

<style scoped></style>
