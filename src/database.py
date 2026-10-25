"""SQLite storage for ProjectMatch's first backend version."""

import json
import sqlite3
import secrets
from contextlib import contextmanager
from pathlib import Path
from werkzeug.security import generate_password_hash

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROJECTS_DB = DATA_DIR / "projects.db"
USERS_DB = DATA_DIR / "users.db"

CATEGORIES = ["Technology", "Research", "Community", "Creative", "Business", "Other"]


def get_connection(path):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def db_connection(path):
    """Open a SQLite connection and always commit/rollback and close it."""
    conn = get_connection(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with db_connection(PROJECTS_DB) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                current_team_amount INTEGER NOT NULL DEFAULT 1,
                max_team_amount INTEGER NOT NULL,
                min_hours INTEGER,
                max_hours INTEGER,
                stage TEXT NOT NULL DEFAULT 'Building',
                about TEXT NOT NULL DEFAULT '',
                roles_needed TEXT NOT NULL DEFAULT '[]',
                owner_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS project_skills (
                project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                skill TEXT NOT NULL,
                PRIMARY KEY (project_id, skill)
            );
        """)

    with db_connection(USERS_DB) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                major TEXT NOT NULL,
                year TEXT NOT NULL,
                availability TEXT,
                looking_for TEXT NOT NULL DEFAULT 'Both'
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

            CREATE TABLE IF NOT EXISTS user_learning (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill TEXT NOT NULL,
                PRIMARY KEY (user_id, skill)
            );
        """)

    migrate_project_fields()
    migrate_user_accounts()


def _add_missing_columns(connection, table, definitions):
    columns = {row["name"] for row in connection.execute(f"PRAGMA table_info({table})")}
    for name, definition in definitions.items():
        if name not in columns:
            connection.execute(f"ALTER TABLE {table} ADD COLUMN {name} {definition}")


def migrate_project_fields():
    """Add project fields introduced after the initial prototype schema."""
    with db_connection(PROJECTS_DB) as connection:
        _add_missing_columns(connection, "projects", {
            "stage": "TEXT NOT NULL DEFAULT 'Building'",
            "about": "TEXT NOT NULL DEFAULT ''",
            "roles_needed": "TEXT NOT NULL DEFAULT '[]'",
            "owner_id": "INTEGER",
        })


def migrate_user_accounts():
    """Add account columns to databases created before signup was implemented."""
    with db_connection(USERS_DB) as connection:
        _add_missing_columns(connection, "users", {
            "username": "TEXT",
            "password_hash": "TEXT",
            "looking_for": "TEXT NOT NULL DEFAULT 'Both'",
        })

        # Preserve existing demo profiles while giving them unique placeholder
        # account names. Their password is intentionally unknown; they can log
        # in using a newly created account instead.
        rows = connection.execute(
            "SELECT id FROM users WHERE username IS NULL OR username = ''"
        ).fetchall()
        for row in rows:
            connection.execute(
                "UPDATE users SET username = ? WHERE id = ?",
                (f"student-{row['id']}", row["id"]),
            )
        rows = connection.execute(
            "SELECT id FROM users WHERE password_hash IS NULL OR password_hash = ''"
        ).fetchall()
        for row in rows:
            connection.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (generate_password_hash(secrets.token_urlsafe(32)), row["id"]),
            )
        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)"
        )


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
    try:
        project["looking_for"] = json.loads(project.pop("roles_needed", "[]") or "[]")
    except (TypeError, json.JSONDecodeError):
        project["looking_for"] = []
    return project


def get_projects(category=None):
    with db_connection(PROJECTS_DB) as connection:
        if category and category != "All":
            rows = connection.execute(
                "SELECT * FROM projects WHERE category = ? ORDER BY id", (category,)
            ).fetchall()
        else:
            rows = connection.execute("SELECT * FROM projects ORDER BY id").fetchall()
        return [_attach_project_skills(connection, dict(row)) for row in rows]


def get_project(project_id):
    with db_connection(PROJECTS_DB) as connection:
        row = connection.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return _attach_project_skills(connection, dict(row)) if row else None


def add_project(data, owner_id=None):
    with db_connection(PROJECTS_DB) as connection:
        cursor = connection.execute(
            """INSERT INTO projects
               (title, description, category, current_team_amount, max_team_amount,
                min_hours, max_hours, stage, about, roles_needed, owner_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (data["title"], data["description"], data["category"],
             data.get("current_team_amount", 1), data["max_team_amount"],
             data.get("min_hours"), data.get("max_hours"),
             data.get("stage", "Building"), data.get("about", data["description"]),
             json.dumps(data.get("looking_for", [])), owner_id),
        )
        project_id = cursor.lastrowid
        connection.executemany(
            "INSERT INTO project_skills (project_id, skill) VALUES (?, ?)",
            [(project_id, skill) for skill in data.get("skills", [])],
        )
        row = connection.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return _attach_project_skills(connection, dict(row))


def get_users():
    with db_connection(USERS_DB) as connection:
        users = [
            dict(row)
            for row in connection.execute(
                """
                SELECT
                    id,
                    name,
                    major,
                    year,
                    availability,
                    looking_for
                FROM users
                ORDER BY id
                """
            )
        ]
        for user in users:
            user["skills"] = [row["skill"] for row in connection.execute(
                "SELECT skill FROM user_skills WHERE user_id = ? ORDER BY skill", (user["id"],)
            )]
            user["interests"] = [row["interest"] for row in connection.execute(
                "SELECT interest FROM user_interests WHERE user_id = ? ORDER BY interest", (user["id"],)
            )]
            user["skills_to_learn"] = [row["skill"] for row in connection.execute(
                "SELECT skill FROM user_learning WHERE user_id = ? ORDER BY skill", (user["id"],)
            )]
        return users


def get_user(user_id):
    return next((user for user in get_users() if user["id"] == user_id), None)

def get_user_by_username(username):

    with db_connection(USERS_DB) as connection:

        row = connection.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,),
        ).fetchone()

        if row is None:
            return None

        return dict(row)


def update_user_password(username, password):
    """Replace an existing user's password hash; return whether user exists."""
    password_hash = generate_password_hash(password, method="pbkdf2:sha256")
    with db_connection(USERS_DB) as connection:
        cursor = connection.execute(
            "UPDATE users SET password_hash = ? WHERE username = ?",
            (password_hash, username),
        )
        return cursor.rowcount == 1

def add_user(data):
    with db_connection(USERS_DB) as connection:

        password_hash = generate_password_hash(
            data["password"],
            method="pbkdf2:sha256"
        )

        cursor = connection.execute(
            """INSERT INTO users
               (username, password_hash, name, major, year, availability, looking_for)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                data["username"],
                password_hash,
                data["name"],
                data["major"],
                data["year"],
                data.get("availability"),
                data.get("looking_for", "Both"),
            ),
        )

        user_id = cursor.lastrowid

        connection.executemany(
            "INSERT INTO user_skills (user_id, skill) VALUES (?, ?)",
            [
                (user_id, skill)
                for skill in data.get("skills", [])
            ],
        )

        connection.executemany(
            "INSERT INTO user_interests (user_id, interest) VALUES (?, ?)",
            [
                (user_id, interest)
                for interest in data.get("interests", [])
            ],
        )
        connection.executemany(
            "INSERT INTO user_learning (user_id, skill) VALUES (?, ?)",
            [(user_id, skill) for skill in data.get("skills_to_learn", [])],
        )

    return get_user(user_id)


def update_user(user_id, data):
    with db_connection(USERS_DB) as connection:
        cursor = connection.execute(
            "UPDATE users SET name = ?, major = ?, year = ?, availability = ?, looking_for = ? WHERE id = ?",
            (data["name"], data["major"], data["year"], data.get("availability"),
             data.get("looking_for", "Both"), user_id),
        )
        if cursor.rowcount == 0:
            return None
        for table, column, values in (
            ("user_skills", "skill", data.get("skills", [])),
            ("user_interests", "interest", data.get("interests", [])),
            ("user_learning", "skill", data.get("skills_to_learn", [])),
        ):
            connection.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
            connection.executemany(
                f"INSERT INTO {table} (user_id, {column}) VALUES (?, ?)",
                [(user_id, value) for value in values],
            )
    return get_user(user_id)
