"""Reset the local SQLite databases and add demo data."""

import backend.app.database as db


PROJECTS = [
    {
        "title": "Campus Tutor Finder",
        "description": "Build a tool that helps students find peer tutors for courses on campus.",
        "category": "Technology",
        "current_team_amount": 2,
        "max_team_amount": 5,
        "min_hours": 3,
        "max_hours": 6,
        "skills": ["Python", "JavaScript", "UI/UX"],
    },
    {
        "title": "Community Garden Map",
        "description": "Map neighborhood gardens and make it easier for volunteers to get involved.",
        "category": "Community",
        "current_team_amount": 1,
        "max_team_amount": 4,
        "min_hours": 2,
        "max_hours": 5,
        "skills": ["Web Development", "Design", "Writing"],
    },
    {
        "title": "Accessible Study Planner",
        "description": "Explore ways to make study planning more accessible and supportive for students.",
        "category": "Research",
        "current_team_amount": 3,
        "max_team_amount": 6,
        "min_hours": 4,
        "max_hours": 8,
        "skills": ["Psychology", "Research", "JavaScript"],
    },
]

USERS = [
    {
        "username": "maya",
        "password": "demo123",
        "name": "Maya Patel",
        "major": "Computer Science",
        "year": "Third Year",
        "availability": "3-5",
        "skills": [
            "Python",
            "Machine Learning",
            "JavaScript"
        ],
        "interests": [
            "AI",
            "Healthcare",
            "Sustainability"
        ]
    },
    {
        "username": "jordan",
        "password": "demo123",
        "name": "Jordan Lee",
        "major": "Visual Communication Design",
        "year": "Second Year",
        "availability": "3-5",
        "skills": [
            "UI/UX",
            "Figma",
            "Graphic Design"
        ],
        "interests": [
            "Education",
            "Accessibility",
            "Community"
        ]
    },
    {
        "username": "ethan",
        "password": "demo123",
        "name": "Ethan Williams",
        "major": "Business Administration",
        "year": "Third Year",
        "availability": "1-2",
        "skills": [
            "Marketing",
            "Business Strategy",
            "Presentations"
        ],
        "interests": [
            "Startups",
            "Technology",
            "Entrepreneurship"
        ]
    },
    {
        "username": "sofia",
        "password": "demo123",
        "name": "Sofia Martinez",
        "major": "Biology",
        "year": "Second Year",
        "availability": "3-5",
        "skills": [
            "Research",
            "Data Analysis",
            "Scientific Writing"
        ],
        "interests": [
            "Healthcare",
            "Environment",
            "Research"
        ]
    },
]


def seed():
    db.reset_db()
    for project in PROJECTS:
        db.add_project(project)
    for user in USERS:
        db.add_user(user)
    print(f"Seeded {len(PROJECTS)} projects and {len(USERS)} students.")


if __name__ == "__main__":
    seed()
