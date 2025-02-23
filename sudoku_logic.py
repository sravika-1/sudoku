import numpy as np
import random

def is_valid(board, row, col, num):
    """Check if it's valid to place `num` in the given row and column."""
    if num in board[row] or num in board[:, col]:  # Check row & column
        return False
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)  # Check 3x3 box
    if num in board[start_row:start_row+3, start_col:start_col+3]:
        return False
    return True

def solve_sudoku(board):
    """Solve Sudoku using backtracking."""
    empty = np.argwhere(board == 0)
    if empty.size == 0:
        return True  # Solved
    row, col = empty[0]
    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row, col] = num
            if solve_sudoku(board):
                return True
            board[row, col] = 0  # Backtrack
    return False

def generate_full_sudoku():
    """Generates a fully solved Sudoku board."""
    board = np.zeros((9, 9), dtype=int)
    for _ in range(9):  # Fill diagonal blocks
        row, col = random.randint(0, 8), random.randint(0, 8)
        num = random.randint(1, 9)
        if is_valid(board, row, col, num):
            board[row, col] = num

    solve_sudoku(board)  # Solve completely
    return board

def remove_numbers(board, difficulty="medium"):
    """Removes numbers to create a playable puzzle."""
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
