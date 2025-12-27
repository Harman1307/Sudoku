import "./App.css";
import React, { useEffect, useState, useRef } from "react";
import { generateBoard } from "./generateBoard.js";

function App() {
  const [clues, setClues] = useState(() => generateBoard());
  const [board, setBoard] = useState(clues.map((r) => [...r]));
  const [showSplash, setShowSplash] = useState(true);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [bestTime, setBestTime] = useState(() => {
    return localStorage.getItem("sudoku-best") || null;
  });
  const [hasWon, setHasWon] = useState(false);

  const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const [selected, setSelected] = useState(null);
  const [selectedInput, setSelectedInput] = useState(null);

  const sounds = useRef({
    pop: null,
    error: null,
    win: null,
    shuffle: null,
  });

  useEffect(() => {
    sounds.current = {
      pop: new Audio("./src/assets/"), //didn't have any good sound for it. may add later.
      error: new Audio("./src/assets/error.mp3"),
      win: new Audio("./src/assets/fanfare.mp3"),
      shuffle: new Audio("./src/assets/shuffle.mp3"),
    };

    Object.values(sounds.current).forEach((sound) => {
      sound.load();
      sound.volume = 0.3;
    });
  }, []);

  function playSound(name) {
    const sound = sounds.current[name];
    if (sound) {
      sound.currentTime = 0.05;
      sound.play().catch(() => {});
    }
  }

  function select(element) {
    setSelectedInput(null);
    const id = element.target.id;
    playSound("pop");
    setSelected(id);
  }

  function selectInput(element) {
    const id = element.target.id;

    if (selected == null) {
      playSound("error");
      return;
    }

    const part = selected.split(", ");
    const row = Number(part[0]);
    const col = Number(part[1]);

    if (clues[row][col] !== 0) {
      playSound("error");
      return;
    }

    const num = id === "9" ? 0 : input[Number(id)];

    if (num !== 0) {
      const tempBoard = board.map((r) => [...r]);
      tempBoard[row][col] = num;

      let isValidMove = true;

      if (tempBoard[row].filter((_, i) => i !== col).includes(num)) {
        isValidMove = false;
      }

      for (let r = 0; r < 9; r++) {
        if (r !== row && tempBoard[r][col] === num) {
          isValidMove = false;
        }
      }

      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if ((r !== row || c !== col) && tempBoard[r][c] === num) {
            isValidMove = false;
          }
        }
      }

      if (!isValidMove) {
        playSound("error");
      } else {
        playSound("pop");
      }
    } else {
      playSound("pop");
    }

    setSelectedInput(id);
  }

  function changeCell(newValue) {
    const id = selected;
    const part = id.split(", ");
    const row = Number(part[0]);
    const col = Number(part[1]);
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = newValue;
    setBoard(newBoard);
  }

  function giveInput() {
    if (selectedInput == null) return;
    if (selected == null) return;

    const id = selected;
    const part = id.split(", ");
    const row = Number(part[0]);
    const col = Number(part[1]);

    if (clues[row][col] !== 0) return;

    if (selectedInput == 9) {
      changeCell(0);
    } else {
      changeCell(input[selectedInput]);
    }
  }

  function isValid(coordinates, num) {
    const id = coordinates;
    const part = id.split(", ");
    const row = Number(part[0]);
    const col = Number(part[1]);

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

  function checkWin() {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        const cell = board[i][j];
        if (cell === 0) return false;
        const id = `${i}, ${j}`;
        if (!isValid(id, cell)) return false;
      }
    }
    return true;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function newGame() {
    playSound("shuffle");
    const puzzle = generateBoard();
    setClues(puzzle);
    setBoard(puzzle.map((r) => [...r]));
    setSelected(null);
    setSelectedInput(null);
    setTime(0);
    setIsRunning(true);
    setHasWon(false);
  }

  useEffect(() => {
    giveInput();
  }, [selectedInput]);

  useEffect(() => {
    setTimeout(() => {
      setShowSplash(false);
    }, 2000);
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && !checkWin()) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, board]);

  useEffect(() => {
    if (checkWin() && board && !hasWon) {
      setHasWon(true);
      setIsRunning(false);
      playSound("win");
      if (!bestTime || time < Number(bestTime)) {
        setBestTime(time);
        localStorage.setItem("sudoku-best", time);
      }
    }
  }, [board]);

  if (showSplash) {
    return (
      <div className="splash">
        <h1>Sudoku</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (hasWon) {
    return (
      <div className="winScreen">
        <div className="winModal">
          <span className="winEmoji">🎉</span>
          <h2>You Won!</h2>
          <div className="winStats">
            <div className="winStat">
              <span className="winStatIcon">⏱️</span>
              <span className="winStatValue">{formatTime(time)}</span>
              <span className="winStatLabel">Time</span>
            </div>
            <div className="winStat">
              <span className="winStatIcon">🏆</span>
              <span className="winStatValue">
                {formatTime(Number(bestTime))}
              </span>
              <span className="winStatLabel">Best</span>
            </div>
          </div>
          {time === Number(bestTime) && (
            <div className="newRecord">New Record!</div>
          )}
          <button className="playAgain" onClick={newGame}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="header">
        <button className="newGame" onClick={newGame}>
          ⟳
        </button>
        <h1>Sudoku</h1>
        <div className="timerContainer">
          <div className="timer">{formatTime(time)}</div>
          {bestTime && (
            <div className="bestTime">Best: {formatTime(Number(bestTime))}</div>
          )}
        </div>
      </div>
      <div className="game">
        <div className="board">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${selected === `${rowIndex}, ${colIndex}` ? "selected" : ""} ${clues[rowIndex][colIndex] !== 0 ? "clue" : ""} ${cell !== 0 && !isValid(`${rowIndex}, ${colIndex}`, cell) ? "invalid" : ""}`}
                id={`${rowIndex}, ${colIndex}`}
                onClick={select}
              >
                {cell !== 0 ? cell : ""}
              </div>
            ))
          )}
        </div>

        <div className="input">
          {input.map((num, index) => (
            <div
              key={index}
              className={`option ${selectedInput === `${index}` ? "selectedInput" : ""}`}
              onClick={selectInput}
              id={`${index}`}
            >
              {num}
            </div>
          ))}
          <div
            className={`delete option ${selectedInput === `9` ? "selectedInput" : ""}`}
            onClick={selectInput}
            id="9"
          >
            X
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
