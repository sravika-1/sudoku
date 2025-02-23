import numpy as np
import random

def is_valid(board, row, col, num):
    """Check if it's valid to place `num` in the given row and column."""
    if num in board[row] or num in board[:, col]:  # Check row & column
        return False

    # Check 3x3 box
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    if num in board[start_row:start_row+3, start_col:start_col+3]:
        return False

    return True

def fill_diagonal_boxes(board):
    """Fill the three diagonal 3x3 boxes with unique numbers from 1-9."""
    for box in range(3):
        start = box * 3
        numbers = np.random.permutation(np.arange(1, 10))  # Unique shuffled numbers
        index = 0
        for i in range(3):
            for j in range(3):
                board[start + i, start + j] = numbers[index]
                index += 1

def solve_sudoku(board):
    """Backtracking algorithm to solve the Sudoku board."""
    for row in range(9):
        for col in range(9):
            if board[row, col] == 0:
                for num in np.random.permutation(np.arange(1, 10)):  # Shuffle numbers
                    if is_valid(board, row, col, num):
                        board[row, col] = num
                        if solve_sudoku(board):
                            return True
                        board[row, col] = 0  # Backtrack
                return False  # No valid number found
    return True  # Solved

def generate_full_sudoku():
    """Generates a fully solved Sudoku board with correct diagonals."""
    board = np.zeros((9, 9), dtype=int)
    fill_diagonal_boxes(board)  # Fill the diagonals first
    solve_sudoku(board)  # Solve the board completely
    return board

def remove_numbers(board, difficulty="medium"):
    """Removes numbers from a solved board to create a playable puzzle."""
    difficulty_mapping = {"easy": 30, "medium": 40, "hard": 50, "expert": 55}
    remove_cells = difficulty_mapping.get(difficulty, 40)

    puzzle = board.copy()
    removed = 0
    while removed < remove_cells:
        row, col = np.random.randint(0, 9, size=2)
        if puzzle[row, col] != 0:
            puzzle[row, col] = 0
            removed += 1

    return puzzle

def generate_sudoku(difficulty="medium"):
    """Generates a Sudoku puzzle and its solution."""
    solution = generate_full_sudoku()  # Generate a fully solved board
    puzzle = remove_numbers(solution, difficulty)  # Remove numbers to create a puzzle
    return puzzle.tolist(), solution.tolist()
