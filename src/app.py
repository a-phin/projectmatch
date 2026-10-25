import os

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash

import database as db
from matching import rank_projects

app = Flask(__name__)
app.secret_key = os.environ.get(
    "PROJECTMATCH_SECRET_KEY",
    "local-development-secret-change-before-deploying",
)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)
db.init_db()


@app.get("/api/projects")
def list_projects():
    category = request.args.get("category")
    if category and category != "All" and category not in db.CATEGORIES:
        return jsonify({"error": f"Unknown category: {category}"}), 400
    return jsonify(db.get_projects(category))


@app.get("/api/projects/<int:project_id>")
def project_details(project_id):
    project = db.get_project(project_id)
    if project is None:
        return jsonify({"error": "Project not found"}), 404
    return jsonify(project)


@app.post("/api/projects")
def create_project():
    data = request.get_json(silent=True) or {}
    required = ("title", "description", "category", "max_team_amount")
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    if data["category"] not in db.CATEGORIES:
        return jsonify({"error": "Unknown category"}), 400
    try:
        max_team_amount = int(data["max_team_amount"])
        current_team_amount = int(data.get("current_team_amount", 1))
        skills = data.get("skills", [])
        if (
            max_team_amount < 2
            or max_team_amount > 20
            or current_team_amount < 1
            or current_team_amount > max_team_amount
        ):
            raise ValueError
        if not isinstance(skills, list) or not all(isinstance(skill, str) and skill.strip() for skill in skills):
            raise ValueError
        data["max_team_amount"] = max_team_amount
        data["current_team_amount"] = current_team_amount
        data["skills"] = [skill.strip() for skill in skills]
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid team size or skills",
            "message": "Team size must be between 2 and 20."
        }), 400
    return jsonify(db.add_project(data)), 201


@app.get("/api/users")
def list_users():
    return jsonify(db.get_users())

@app.get("/api/users/<int:user_id>/matches")
def user_matches(user_id):

    student = db.get_user(user_id)

    if student is None:
        return jsonify({
            "error": "User not found"
        }), 404

    projects = db.get_projects()

    matches = rank_projects(
        student,
        projects
    )

    return jsonify(matches)

@app.get("/api/users/<int:user_id>")
def user_details(user_id):
    user = db.get_user(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.post("/api/users")
def create_user():
    data = request.get_json(silent=True) or {}
    required = ("username", "password", "name", "major", "year")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    for field in ("skills", "interests"):
        if not isinstance(data.get(field, []), list):
            return jsonify({"error": f"{field} must be a list"}), 400
    return jsonify(db.add_user(data)), 201


@app.put("/api/me")
def update_current_user():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json(silent=True) or {}
    required = ("name", "major", "year")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    for field in ("skills", "interests"):
        if not isinstance(data.get(field, []), list):
            return jsonify({"error": f"{field} must be a list"}), 400

    user = db.update_user(user_id, data)
    if user is None:
        session.clear()
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@app.post("/api/signup")
def signup():

    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "error": "Username and password are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters"
        }), 400

    existing_user = db.get_user_by_username(
        username
    )

    if existing_user is not None:
        return jsonify({
            "error": "Username already exists"
        }), 409

    user_data = {
        "username": username,
        "password": password,

        # Profile can be completed later
        "name": username,
        "major": "Not specified",
        "year": "Not specified",
        "availability": None,
        "skills": [],
        "interests": []
    }

    user = db.add_user(user_data)

    session["user_id"] = user["id"]

    return jsonify(user), 201

@app.post("/api/login")
def login():

    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "error": "Username and password are required"
        }), 400

    user_account = db.get_user_by_username(
        username
    )

    if user_account is None:
        return jsonify({
            "error": "Invalid username or password"
        }), 401

    if not check_password_hash(
        user_account["password_hash"],
        password
    ):
        return jsonify({
            "error": "Invalid username or password"
        }), 401

    session["user_id"] = user_account["id"]

    user = db.get_user(
        user_account["id"]
    )

    return jsonify(user)

@app.get("/api/me")
def current_user():

    user_id = session.get("user_id")

    if user_id is None:
        return jsonify({
            "error": "Not logged in"
        }), 401

    user = db.get_user(user_id)

    if user is None:
        session.clear()

        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify(user)

@app.post("/api/logout")
def logout():

    session.clear()

    return jsonify({
        "message": "Logged out successfully"
    })

if __name__ == "__main__":
    app.run(debug=True, port=5001)
