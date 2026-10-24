from flask import Flask, jsonify, request
from flask_cors import CORS

import database as db

app = Flask(__name__)
CORS(app)

DEMO_USER_ID = 1

@app.get("/api/projects")
def list_projects():
    category = request.args.get("category")

    if category and category != "All" and category not in db.CATEGORIES:
        return jsonify({"error": f"Unknown category: {category}"}), 400

def project_details(project_id):
    """Displays information for a sample project on the page."""

@app.get("/api/users")
def list_users():
    """Retrieves all seed users for the find teammates list."""
    return jsonify(db.get_users())

if __name__ == "__main__":
    app.run(debug=True, port=5001)