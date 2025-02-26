let timer;
let correctMoves = 0;
let wrongMoves = 0;
let solutionGrid = [];
let gameDifficulty = "medium";
let userInputs = {};  
let music = document.getElementById("background-music");  // Get audio element
let currentUsername = ""; 
let maxHints = 5; // Maximum allowed hints
let hintsUsed = 0; // Track used hints

function setUsername() {
    let username = document.getElementById("username").value;
    if (username.trim() === "") return alert("Enter a valid name!");
    currentUsername = username;  // Store username globally
    fetch("/set_username", {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" }
    }).then(response => response.json()).then(data => {
        document.getElementById("user-name-display").innerText = data.username;
        document.getElementById("username-section").style.display = "none";
        document.getElementById("difficulty-section").style.display = "block";
    });
}

function startGame() {
    gameDifficulty = document.getElementById("difficulty").value;
    // Start the background music when the game starts
    music.play();

    fetch(`/generate?difficulty=${gameDifficulty}`)
        .then(response => response.json())
        .then(data => {
            solutionGrid = data.solution; // Store the correct solution
            displaySudoku(data.puzzle);
            document.getElementById("game-user-name").innerText = currentUsername; // Use stored username
            document.getElementById("difficulty-section").style.display = "none";
            document.getElementById("game-section").style.display = "block";
            startTimer(gameDifficulty);
        });
}
function displaySudoku(puzzle) {
    let grid = document.getElementById("sudoku-grid");
    grid.innerHTML = "";

    puzzle.forEach((row, r) => {
        row.forEach((num, c) => {
            let cell = document.createElement("input");
            cell.type = "text";
            cell.classList.add("cell");
            cell.value = num ? num : "";
            cell.readOnly = num !== 0;
            cell.dataset.row = r;
            cell.dataset.col = c;

            // ✅ Fixing Thick Borders for 3x3 Boxes
            if ((r + 1) % 3 === 0 && r !== 8) cell.style.borderBottom = "3px solid black";
            if ((c + 1) % 3 === 0 && c !== 8) cell.style.borderRight = "3px solid black";
            if (r === 0) cell.style.borderTop = "3px solid black";
            if (c === 0) cell.style.borderLeft = "3px solid black";

            if (num === 0) {
                cell.addEventListener("input", (e) => trackMoves(e, r, c));
            }

            grid.appendChild(cell);
        });
    });
}



function trackMoves(e, row, col) {
    let value = parseInt(e.target.value);
    if (!value || isNaN(value)) return;
    
    // Store user input for final validation
    userInputs[`${row}-${col}`] = value;

    // If Easy mode, highlight incorrect values immediately
   // if (gameDifficulty === "easy") {
        if (value !== solutionGrid[row][col]) {
            e.target.classList.add("wrong-move");
        } else {
            e.target.classList.remove("wrong-move");
        }
   // }
}

function startTimer(difficulty) {
    let time = { easy: 30, medium: 600, hard: 600, expert: 600 }[difficulty];
    timer = setInterval(() => {
        if (time <= 0) {
            clearInterval(timer);
            endGame();
        } else {
            document.getElementById("timer").innerText = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
            time--;
        }
    }, 1000);
}

function endGame() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("game-over-section").style.display = "block";
    document.getElementById("final-username").innerText = document.getElementById("user-name-display").innerText;

    let solvedGrid = document.getElementById("solved-sudoku-grid");
    solvedGrid.innerHTML = "";
    wrongMoves = 0;
    correctMoves = 0;

    solutionGrid.forEach((row, r) => {
        row.forEach((num, c) => {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText = num;

            let userMove = userInputs[`${r}-${c}`];

            // Highlight only incorrect moves in red, but keep the correct value
            if (userMove !== undefined) {
                if (userMove !== num) {
                    cell.classList.add("wrong-move");
                    wrongMoves++;
                } else {
                    correctMoves++;
                }
            }

            solvedGrid.appendChild(cell);
        });
    });

    document.getElementById("correct-moves").innerText = correctMoves;
    document.getElementById("wrong-moves").innerText = wrongMoves;

    // Stop the background music when the game ends
    music.pause();
    music.currentTime = 0;
}

function restartGame() {
    location.reload();
}
function useHint() {
    if (hintsUsed >= maxHints) {
        alert("No hints left! Use them wisely.");
        return;
    }

    let wrongCells = Array.from(document.querySelectorAll(".wrong-move"));
    let cellToFill = null;

    // Prioritize correcting a wrong move
    if (wrongCells.length > 0) {
        cellToFill = wrongCells[0]; // Select first incorrect input
    } else {
        // If no wrong move, find an empty cell randomly
        let emptyCells = Array.from(document.querySelectorAll(".cell")).filter(cell => cell.value === "");
        if (emptyCells.length === 0) {
            alert("No empty cells left for hints!");
            return;
        }
        cellToFill = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    if (cellToFill) {
        let row = parseInt(cellToFill.dataset.row);
        let col = parseInt(cellToFill.dataset.col);
        cellToFill.value = solutionGrid[row][col]; // Fill correct answer
        cellToFill.classList.remove("wrong-move"); // Remove red highlight if fixing a wrong move
        cellToFill.classList.add("hinted-cell"); // Add highlight class
        cellToFill.readOnly = true; // Lock the cell
        hintsUsed++;
        document.getElementById("hint-count").innerText = maxHints - hintsUsed; // Update hint counter
    }
}

