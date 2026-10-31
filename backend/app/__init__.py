import os
import secrets

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import check_password_hash

import backend.app.database as db
from backend.app.matching import rank_projects

app = Flask(__name__)
app.secret_key = os.environ.setdefault("PROJECTMATCH_SECRET_KEY", secrets.token_hex(32))
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173", "http://127.0.0.1:5173"]
)
db.init_db()


def valid_string_list(value):
    return isinstance(value, list) and all(
        isinstance(item, str) and item.strip() for item in value
    )


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
    owner_id = session.get("user_id")
    if owner_id is None:
        return jsonify({"error": "Log in before posting a project"}), 401

    data = request.get_json(silent=True) or {}
    required = ("title", "description", "category", "max_team_amount")
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    if any(not isinstance(data[field], str) for field in ("title", "description", "category")):
        return jsonify({"error": "Title, description, and category must be text"}), 400
    if data["category"] not in db.CATEGORIES:
        return jsonify({"error": "Unknown category"}), 400
    try:
        max_team_amount = int(data["max_team_amount"])
        current_team_amount = int(data.get("current_team_amount", 1))
        skills = data.get("skills", [])
        min_hours = data.get("min_hours")
        max_hours = data.get("max_hours")
        min_hours = int(min_hours) if min_hours is not None else None
        max_hours = int(max_hours) if max_hours is not None else None
        if (
            max_team_amount < 2
            or max_team_amount > 20
            or current_team_amount < 1
            or current_team_amount > max_team_amount
        ):
            raise ValueError
        if not valid_string_list(skills):
            raise ValueError
        if min_hours is not None and min_hours < 0:
            raise ValueError
        if max_hours is not None and max_hours < 0:
            raise ValueError
        if min_hours is not None and max_hours is not None and min_hours > max_hours:
            raise ValueError
        for field in ("stage", "about"):
            if field in data and not isinstance(data[field], str):
                raise ValueError
        looking_for = data.get("looking_for", [])
        if not valid_string_list(looking_for):
            raise ValueError
        data["max_team_amount"] = max_team_amount
        data["current_team_amount"] = current_team_amount
        data["min_hours"] = min_hours
        data["max_hours"] = max_hours
        data["skills"] = [skill.strip() for skill in skills]
        data["looking_for"] = [role.strip() for role in looking_for]
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid team size or skills",
            "message": "Team size must be between 2 and 20."
        }), 400
    return jsonify(db.add_project(data, owner_id=owner_id)), 201


@app.get("/api/users")
def list_users():
    return jsonify(db.get_users())

@app.get("/api/me/matches")
def current_user_matches():
    user_id = session.get("user_id")
    if user_id is None:
        return jsonify({"error": "Not logged in"}), 401

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
    if not isinstance(data["password"], str) or len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    for field in ("name", "major", "year"):
        if not isinstance(data[field], str):
            return jsonify({"error": f"{field} must be text"}), 400
    for field in ("skills", "interests", "skills_to_learn"):
        if not valid_string_list(data.get(field, [])):
            return jsonify({"error": f"{field} must be a list"}), 400
    if not isinstance(data["username"], str):
        return jsonify({"error": "Username must be text"}), 400
    username = data["username"].strip()
    if not username or db.get_user_by_username(username):
        return jsonify({"error": "Username is empty or already exists"}), 409
    data["username"] = username
    looking_for = data.get("looking_for", "Both")
    if looking_for not in ("Join Projects", "Find Teammates", "Both"):
        return jsonify({"error": "Invalid looking_for value"}), 400
    data["looking_for"] = looking_for
    availability = data.get("availability")
    if availability is not None and availability not in ("1-2", "3-5", "6-8", "9+"):
        return jsonify({"error": "Invalid availability value"}), 400
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
    for field in ("skills", "interests", "skills_to_learn"):
        if not valid_string_list(data.get(field, [])):
            return jsonify({"error": f"{field} must be a list"}), 400
    for field in ("name", "major", "year"):
        if not isinstance(data[field], str):
            return jsonify({"error": f"{field} must be text"}), 400
    looking_for = data.get("looking_for", "Both")
    if not isinstance(looking_for, str) or looking_for not in ("Join Projects", "Find Teammates", "Both"):
        return jsonify({"error": "Invalid looking_for value"}), 400
    availability = data.get("availability")
    if availability is not None and availability not in ("1-2", "3-5", "6-8", "9+"):
        return jsonify({"error": "Invalid availability value"}), 400
    data["looking_for"] = looking_for

    user = db.update_user(user_id, data)
    if user is None:
        session.clear()
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@app.post("/api/signup")
def signup():

    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    if not isinstance(username, str):
        return jsonify({"error": "Username must be text"}), 400
    username = username.strip()
    password = data.get("password", "")

    if not username or not isinstance(password, str) or not password:
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

    username = data.get("username", "")
    if not isinstance(username, str):
        return jsonify({"error": "Username must be text"}), 400
    username = username.strip()
    password = data.get("password", "")

    if not username or not isinstance(password, str) or not password:
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
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1", port=5001)
