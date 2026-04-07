"""
Central entry point for the MyHomeLab backend.

All app-specific blueprints are registered here.
Adding a new app only requires:
  1. Creating BackEnd/<app_name>/routes.py that exposes a `blueprint`
  2. Importing and registering it below.

Run:
  python -m BackEnd.serve
  or: python BackEnd/serve.py
"""

from flask import Flask

from BackEnd.todo.routes import blueprint as todo_blueprint

# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> Flask:
    app = Flask(__name__)

    # ── CORS (applied globally to every response) ──────────────────────────
    @app.before_request
    def _handle_preflight():
        from flask import request
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            _apply_cors(response)
            return response

    @app.after_request
    def _apply_cors_after(response):
        _apply_cors(response)
        return response

    # ── Register blueprints ────────────────────────────────────────────────
    app.register_blueprint(todo_blueprint, url_prefix="/api/todos")

    # Register future app blueprints here, e.g.:
    # from BackEnd.notes.routes import blueprint as notes_blueprint
    # app.register_blueprint(notes_blueprint, url_prefix="/api/notes")

    return app


def _apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
