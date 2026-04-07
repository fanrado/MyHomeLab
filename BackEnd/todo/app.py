"""
To-Do List Flask backend.
Stores todos in a CSV file at BackEnd/todo/data/todos.csv.

Run:  python -m BackEnd.todo.app
  or: python BackEnd/todo/app.py
"""

import csv
import io
import os
import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CSV_FILE = os.path.join(DATA_DIR, "todos.csv")
FIELDNAMES = ["id", "title", "completed", "created_at"]

os.makedirs(DATA_DIR, exist_ok=True)


# ── CORS ──────────────────────────────────────────────────────────────────────

@app.before_request
def _handle_preflight():
    """Return 204 immediately for OPTIONS preflight requests."""
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        _apply_cors(response)
        return response


@app.after_request
def _apply_cors_after(response):
    _apply_cors(response)
    return response


def _apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"


# ── CSV helpers ───────────────────────────────────────────────────────────────

def _read_todos() -> list[dict]:
    if not os.path.exists(CSV_FILE):
        return []
    with open(CSV_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        todos = []
        for row in reader:
            row["completed"] = row.get("completed", "false").lower() == "true"
            todos.append(row)
    return todos


def _write_todos(todos: list[dict]) -> None:
    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for todo in todos:
            writer.writerow({
                "id": todo["id"],
                "title": todo["title"],
                "completed": str(todo["completed"]).lower(),
                "created_at": todo["created_at"],
            })


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/api/todos", methods=["GET"])
def get_todos():
    return jsonify(_read_todos())


@app.route("/api/todos", methods=["POST"])
def create_todo():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    new_todo = {
        "id": str(uuid.uuid4()),
        "title": title,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    todos = _read_todos()
    todos.insert(0, new_todo)
    _write_todos(todos)
    return jsonify(new_todo), 201


# NOTE: /api/todos/export must be registered before /api/todos/<todo_id>
# so Flask resolves the static segment "export" with higher priority.

@app.route("/api/todos/export", methods=["GET"])
def export_todos():
    todos = _read_todos()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=FIELDNAMES)
    writer.writeheader()
    for todo in todos:
        writer.writerow({
            "id": todo["id"],
            "title": todo["title"],
            "completed": str(todo["completed"]).lower(),
            "created_at": todo["created_at"],
        })
    return app.response_class(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=todos.csv"},
    )


@app.route("/api/todos/import", methods=["POST"])
def import_todos():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "File must be a .csv"}), 400

    try:
        content = file.stream.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        todos = []
        for row in reader:
            row_id = row.get("id", "").strip()
            row_title = row.get("title", "").strip()
            # Skip rows missing required fields to prevent CSV injection
            if not row_id or not row_title:
                continue
            todos.append({
                "id": row_id,
                "title": row_title,
                "completed": row.get("completed", "false").lower() == "true",
                "created_at": row.get("created_at", datetime.now(timezone.utc).isoformat()),
            })
        _write_todos(todos)
        return jsonify({"imported": len(todos)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


@app.route("/api/todos/<todo_id>", methods=["PUT"])
def update_todo(todo_id):
    data = request.get_json(silent=True) or {}
    todos = _read_todos()
    for todo in todos:
        if todo["id"] == todo_id:
            if "title" in data:
                new_title = data["title"].strip()
                if not new_title:
                    return jsonify({"error": "title cannot be empty"}), 400
                todo["title"] = new_title
            if "completed" in data:
                todo["completed"] = bool(data["completed"])
            _write_todos(todos)
            return jsonify(todo)
    return jsonify({"error": "Todo not found"}), 404


@app.route("/api/todos/<todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    todos = _read_todos()
    remaining = [t for t in todos if t["id"] != todo_id]
    if len(remaining) == len(todos):
        return jsonify({"error": "Todo not found"}), 404
    _write_todos(remaining)
    return "", 204


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
