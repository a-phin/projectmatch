"""SQLite storage for ProjectMatch's first backend version."""

import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROJECTS_DB = DATA_DIR / "projects.db"
USERS_DB = DATA_DIR / "users.db"

CATEGORIES = ["Technology", "Research", "Community", "Creative"]


def get_connection(path):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    with get_connection(PROJECTS_DB) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                current_team_amount INTEGER NOT NULL DEFAULT 1,
                max_team_amount INTEGER NOT NULL,
                min_hours INTEGER,
                max_hours INTEGER
            );

            CREATE TABLE IF NOT EXISTS project_skills (
                project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                skill TEXT NOT NULL,
                PRIMARY KEY (project_id, skill)
            );
        """)

    with get_connection(USERS_DB) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                major TEXT NOT NULL,
                year TEXT NOT NULL,
                availability TEXT
            );

            CREATE TABLE IF NOT EXISTS user_skills (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill TEXT NOT NULL,
                PRIMARY KEY (user_id, skill)
            );

            CREATE TABLE IF NOT EXISTS user_interests (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                interest TEXT NOT NULL,
                PRIMARY KEY (user_id, interest)
            );
        """)

    with get_connection(USERS_DB) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                major TEXT NOT NULL,
                year TEXT NOT NULL,
                availability TEXT
            );
            CREATE TABLE IF NOT EXISTS user_skills (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill TEXT NOT NULL,
                PRIMARY KEY (user_id, skill)
            );
            CREATE TABLE IF NOT EXISTS user_interests (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                interest TEXT NOT NULL,
                PRIMARY KEY (user_id, interest)
            );
        """)


def reset_db():
    """Recreate the two local databases. Intended for development seeding."""
    for path in (PROJECTS_DB, USERS_DB):
        path.unlink(missing_ok=True)
    init_db()


def _attach_project_skills(connection, project):
    project["skills"] = [row["skill"] for row in connection.execute(
        "SELECT skill FROM project_skills WHERE project_id = ? ORDER BY skill",
        (project["id"],),
    )]
    return project


def get_projects(category=None):
    with get_connection(PROJECTS_DB) as connection:
        if category and category != "All":
            rows = connection.execute(
                "SELECT * FROM projects WHERE category = ? ORDER BY id", (category,)
            ).fetchall()
        else:
            rows = connection.execute("SELECT * FROM projects ORDER BY id").fetchall()
        return [_attach_project_skills(connection, dict(row)) for row in rows]


def get_project(project_id):
    with get_connection(PROJECTS_DB) as connection:
        row = connection.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return _attach_project_skills(connection, dict(row)) if row else None


def add_project(data):
    with get_connection(PROJECTS_DB) as connection:
        cursor = connection.execute(
            """INSERT INTO projects
               (title, description, category, current_team_amount, max_team_amount, min_hours, max_hours)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data["title"], data["description"], data["category"],
             data.get("current_team_amount", 1), data["max_team_amount"],
             data.get("min_hours"), data.get("max_hours")),
        )
        project_id = cursor.lastrowid
        connection.executemany(
            "INSERT INTO project_skills (project_id, skill) VALUES (?, ?)",
            [(project_id, skill) for skill in data.get("skills", [])],
        )
        row = connection.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return _attach_project_skills(connection, dict(row))


def get_users():
    with get_connection(USERS_DB) as connection:
        users = [dict(row) for row in connection.execute("SELECT * FROM users ORDER BY id")]
        for user in users:
            user["skills"] = [row["skill"] for row in connection.execute(
                "SELECT skill FROM user_skills WHERE user_id = ? ORDER BY skill", (user["id"],)
            )]
            user["interests"] = [row["interest"] for row in connection.execute(
                "SELECT interest FROM user_interests WHERE user_id = ? ORDER BY interest", (user["id"],)
            )]
        return users


def get_user(user_id):
    return next((user for user in get_users() if user["id"] == user_id), None)


def add_user(data):
    with get_connection(USERS_DB) as connection:
        cursor = connection.execute(
            "INSERT INTO users (name, major, year, availability) VALUES (?, ?, ?, ?)",
            (data["name"], data["major"], data["year"], data.get("availability")),
        )
        user_id = cursor.lastrowid
        connection.executemany(
            "INSERT INTO user_skills (user_id, skill) VALUES (?, ?)",
            [(user_id, skill) for skill in data.get("skills", [])],
        )
        connection.executemany(
            "INSERT INTO user_interests (user_id, interest) VALUES (?, ?)",
            [(user_id, interest) for interest in data.get("interests", [])],
        )
    return get_user(user_id)
