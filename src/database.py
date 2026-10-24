'''
DATABASE

Users
- name
- major
- year
- skills
- bio?
- interests
- availability

Project Postings
- project title
- details
- status
- looking for
- commitment
- experience
'''
import sqlite3

# Adds project to the discover page
def add_project(title: str, description: str, category: str, current_num_team, max_num_team, min_hours, max_hours, project_lead):

    connection = sqlite3.connect("projects.db")
    cursor = connection.cursor()

    cursor.execute("INSERT into projects") # fix

    connection.close()

def delete_project(name):
    pass