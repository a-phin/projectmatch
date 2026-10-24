#pip install flask flask-cors

#This serves as the MAIN 
# 1. It imports the data from SQL 
# 2. ranks the projects from user peferences
# 3. converts the ranked projects into a url react can understand 

# 1. Bring in the tools we need
from flask import Flask, jsonify, request   # Flask = the web server
from flask_cors import CORS                 # lets React talk to this server

from db import get_conn, load_projects      # your database code
from matching import rank_projects          # your scoring code

# 2. Create the server
app = Flask(__name__)
CORS(app)


# 3. A route: "when someone visits /api/matches, run this function"
@app.get("/api/matches")
def matches():

    # Step A: read the student's info from the URL
    skills_text = request.args.get("skills")        # "python,sql"
    interests_text = request.args.get("interests")  # "web"
    hours = request.args.get("hours", type=int)     # 6

    # Step B: turn "python,sql" into ["python", "sql"]
    skills = skills_text.split(",") if skills_text else []
    interests = interests_text.split(",") if interests_text else []

    student = {"skills": skills, "interests": interests, "hours": hours}

    # Step C: get the projects from the database
    conn = get_conn()
    projects = load_projects(conn)
    conn.close()

    # Step D: rank them and send the result back
    ranked = rank_projects(student, projects)
    return jsonify(ranked)


# 4. Start the server when you run `python api.py`
if __name__ == "__main__":
    app.run(debug=True)

