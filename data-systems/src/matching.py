from dataclasses import dataclass, field

# skills 
# time (in total)
# goal to do/learns
# interests/genre
# major -  
# experience - beginer, 


# matching.py

def rank_projects(student, projects):
    # only projects that still have room
    open_projects = [p for p in projects if p["current_team_amount"] < p["max_team_amount"]]

    results = [score_project(student, p) for p in open_projects]
    return sorted(results, key=lambda r: r["score"], reverse=True)

def score_project(student, project):
    skills = score_skills(student.get("skills"), project.get("skills"))
    hours = score_hours(student.get("hours"), project.get("min_hours"), project.get("max_hours"))
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

    have = {s.lower() for s in student_skills}
    needed = {s.lower() for s in project_skills}
    return 50 * len(have & needed) / len(needed) #checks for overlap and returns score from that


def score_hours(student_hours, min_hours, max_hours):
    """Up to 25 points: does the student's weekly time fit the project?"""
    if student_hours is None:
        return 12.5  # no data, so give half the points so it doesn't go unnoticed

    min_hours = min_hours or 0
    max_hours = max_hours or 999

    if student_hours < min_hours:
        return 0     # not enough time
    if student_hours > max_hours:
        return 20    # more time than needed: fine, not perfect
    return 25        # fits the range


def score_category(student_interests, category):
    """25 points if the project's category is one of the student's interests."""
    if not student_interests:
        return 12.5  # no data, so give half the points

    interests = [i.lower() for i in student_interests]
    return 25 if category.lower() in interests else 0 #checks if category is in interests

#test 
if __name__ == "__main__":
    student = {"skills": ["python", "sql"], "hours": 6, "interests": ["web"]}
    project = {
        "id": 1, "title": "Campus Tutor Finder", "category": "Web",
        "current_team_amount": 2, "max_team_amount": 5,
        "min_hours": 4, "max_hours": 8,
        "skills": ["python", "sql", "react"],
    }
    print(rank_projects(student, [project]))