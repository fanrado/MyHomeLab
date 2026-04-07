"""
Standalone shim for the To-Do app.
Useful for isolated testing of this blueprint without the full server.

Prefer running BackEnd/serve.py (python -m BackEnd.serve) in production.
"""

from BackEnd.todo.routes import blueprint
from flask import Flask

app = Flask(__name__)
app.register_blueprint(blueprint, url_prefix="/api/todos")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
