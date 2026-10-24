import sqlite3
from pathlib import Path

# Path constants.
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROJECTS_DB = DATA_DIR / "projects.db"
USERS_DB = DATA_DIR / "users.db"

# List of categories stored in a categories constant variable.
CATEGORIES = ["Technology", "Research", "Community", "Creative"]

# List of skills stored in a skills constant variable.
SKILLS = [
    "Python", "JavaScript", "Java", "SQL", "Web Development", "AI",
    "UI/UX", "Design", "Web Design", "Photography", "Video Editing",
    "Marketing", "Business Strategy", "Biology", "Psychology",
    "Journalism", "Writing", "Education", "Music",
]

# GENERAL DATABASE COMMANDS
def get_connection(path):
    DATA_DIR.mkdir(exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection

def init_db():
    projects_con = get_connection(PROJECTS_DB)
    projects_con.executescript("""
        CREATE TABLE IF NOT EXISTS projects (
        title TEXT NOT NULL, 
        description TEXT NOT NULL, 
        category TEXT NOT NULL
        current_team_amount INTEGER NOT NULL DEFAULT 1,
        max_team_amount INTEGER NOT NULL,
        min_hours INTEGER,
        max_hours INTEGER
    );
    CREATE TABLE IF NOT EXISTS skills (
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE
        skill TEXT NOT NULL,
        PRIMARY KEY (project_id, skill)
    );
""")
    projects_con.close()

    users_con = get_connection(USERS_DB)
    users_con.executescript("""
        CREATE TABLE IF NOT EXISTS user_skills (
            name TEXT NOT NULL,
            major TEXT NOT NULL,
            year INTEGER NOT NULL,
            interests TEXT,
            skills TEXT
            skills_to_learn TEXT,
            availability INTEGER
        );
    """)
    users_con.close()


def reset_db():
    """Deletes databases and recreates them empty - for seed.py"""
    for path in (PROJECTS_DB, USERS_DB):
        path.unlink(missing_ok=True)
        init_db()

# PROJECT DATABASE COMMANDS

# Adds project to the discover page
def add_project(title: str, description: str, category: str, current_num_team, max_num_team, min_hours, max_hours):

    connection = sqlite3.connect("projects.db")
    cursor = connection.cursor()

    cursor.execute("INSERT into projects (title, description, category, current_team_amount, max_team_amount, min_hours, max_hours)") # fix

    connection.close()

def delete_project(title, project_lead):
    connection = sqlite3.connect("projects.db")
    cursor = connection.cursor()

    connection.close()



def get_projects(category=None):
    connection = sqlite3.connect("projects.db")
    if category and category != "All":
        rows = connection.execute("SELECT * FROM projects WHERE category = ?", (category,)).fetchall()
    else:
        rows = connection.execute("SELECT * FROM projects").fetchall()

    # Initialize projects as a list of projects to return
    projects = []
    for row in rows:
        project = dict(row)
        skills = connection.execute("SELECT * FROM projects WHERE category = ?", (category, )).fetchall()
        project["skills"] = [r["skill"] for r in skills]
        projects.append(project)
    
    connection.close()
    return projects

# USER DATABASE COMMANDS
def get_users(id):
    connection = get_connection(USERS_DB)
    user_row = connection.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
    if user_row is None:
        connection.close()
        return None
    user = dict(user_row)
    skills = connection.execute("SELECT skill from skills WHERE id = ?", (user_id,)).fetchall()
    user["skills"] = [r["skill"] for r in skills]
    connection.close()
    return user