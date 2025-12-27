export function generateBoard() {
  function createEmptyBoard() {
    return [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr;
  }

  function canPlace(num, row, col, board) {
    if (board[row].filter((_, i) => i !== col).includes(num)) {
      return false;
    }

    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === num) {
        return false;
      }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row || c !== col) {
          if (board[r][c] === num) {
            return false;
          }
        }
      }
    }

    return true;
  }

  function fillDiagonalBoxes(board, startRow, startCol) {
    const num = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        board[r][c] = num[index];
        index++;
      }
    }
  }

  const board = createEmptyBoard();

  fillDiagonalBoxes(board, 0, 0);
  fillDiagonalBoxes(board, 3, 3);
  fillDiagonalBoxes(board, 6, 6);

  function solve(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] == 0) {
          for (let num = 1; num <= 9; num++) {
            if (canPlace(num, r, c, board)) {
              board[r][c] = num;

              if (solve(board)) {
                return true;
              }

              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function removeNumbers(board, count) {
    let removed = 0;

    while (removed < count) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);

      if (board[r][c] !== 0) {
        board[r][c] = 0;
        removed++;
      }
    }
  }

  solve(board);
  removeNumbers(board, 45);

  return board;
}
