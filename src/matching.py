# This is the ranking system


def rank_projects(student, projects):
    # only projects that still have room
    open_projects = [p for p in projects if p["current_team_amount"] < p["max_team_amount"]]

    results = [score_project(student, p) for p in open_projects]
    return sorted(results, key=lambda r: r["score"], reverse=True)

def score_project(student, project):
    skills = score_skills(student.get("skills"), project.get("skills"))
    hours = score_hours(student.get("availability"), project.get("min_hours"), project.get("max_hours"))
    category = score_category(student.get("interests"), project["category"])

    return {
        "project_id": project["id"],
        "title": project["title"],
        "score": round(skills + hours + category),
        "breakdown": {"skills": skills, "hours": hours, "category": category},
    }

def score_skills(student_skills, project_skills):
    """Up to 50 points: how many of the project's skills the student has."""
    if not student_skills or not project_skills:
        return 25  # no data, so give half the points so it doesn't go unnoticed

    have = {s.strip().lower() for s in student_skills if isinstance(s, str)}
    needed = {s.strip().lower() for s in project_skills if isinstance(s, str)}
    return 50 * len(have & needed) / len(needed) #checks for overlap and returns score from that


def score_hours(student_hours, min_hours, max_hours):
    """Up to 25 points based on how well the student's availability
    overlaps with the project's expected weekly hours."""

    if not student_hours:
        return 12.5

    # Student availability may be stored as "3-5"
    # or as a single value such as "5".
    try:
        if isinstance(student_hours, str) and student_hours.strip().endswith("+"):
            student_min = int(student_hours.strip()[:-1])
            student_max = 999
        elif isinstance(student_hours, str) and "-" in student_hours:
            parts = student_hours.split("-")
            student_min = int(parts[0].strip())
            student_max = int(parts[1].strip())
        else:
            student_min = int(student_hours)
            student_max = int(student_hours)
    except (ValueError, TypeError):
        return 12.5

    project_min = min_hours or 0
    project_max = max_hours or 999

    # No overlap between the ranges
    if student_max < project_min:
        return 0

    # Student has more availability than the project needs
    if student_min > project_max:
        return 20

    # Availability ranges overlap
    return 25


def score_category(student_interests, category):
    """25 points if the project's category is one of the student's interests."""
    if not student_interests:
        return 12.5  # no data, so give half the points

    interests = [i.strip().lower() for i in student_interests if isinstance(i, str)]
    return 25 if isinstance(category, str) and category.strip().lower() in interests else 0

#test 
if __name__ == "__main__":
    student = {"skills": ["python", "sql"], "availability": 6, "interests": ["web"]}
    project = {
        "id": 1, "title": "Campus Tutor Finder", "category": "Web",
        "current_team_amount": 2, "max_team_amount": 5,
        "min_hours": 4, "max_hours": 8,
        "skills": ["python", "sql", "react"],
    }
    print(rank_projects(student, [project]))
