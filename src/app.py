from flask import Flask, jsonify, request
from flask_cors import CORS

import database as db

app = Flask(__name__)
CORS(app)
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


@app.get("/api/users/<int:user_id>")
def user_details(user_id):
    user = db.get_user(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.post("/api/users")
def create_user():
    data = request.get_json(silent=True) or {}
    required = ("name", "major", "year")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return jsonify({"error": "Missing required fields", "fields": missing}), 400
    for field in ("skills", "interests"):
        if not isinstance(data.get(field, []), list):
            return jsonify({"error": f"{field} must be a list"}), 400
    return jsonify(db.add_user(data)), 201


if __name__ == "__main__":
    app.run(debug=True, port=5001)
