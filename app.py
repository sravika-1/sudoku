from flask import Flask, render_template, request, jsonify, session
from sudoku_logic import generate_sudoku
from flask_cors import CORS

app = Flask(__name__, template_folder="templates")
app.secret_key = "harrypotter123"
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/set_username", methods=["POST"])
def set_username():
    session["username"] = request.json.get("username", "Player")
    return jsonify({"message": "Username set", "username": session["username"]})

@app.route("/generate", methods=["GET"])
def generate():
    difficulty = request.args.get("difficulty", "medium")
    puzzle, solution = generate_sudoku(difficulty)
    session["solution"] = solution  # Store the correct solution in the session
    return jsonify({"puzzle": puzzle, "solution": solution})

if __name__ == "__main__":
    app.run(debug=True)
