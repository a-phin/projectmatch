# run.py
from db import get_conn, load_projects
from matching import rank_projects

# hand-written student until your users table is ready
student = {"skills": ["python", "sql"], "hours": 6, "interests": ["web"]}

conn = get_conn()
matches = rank_projects(student, load_projects(conn))

for m in matches[:5]:   # top 5
    print(m["score"], m["title"], m["breakdown"])