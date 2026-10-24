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
def add_project(name):

    connection = sqlite3.connect("projects.db")
    cursor = connection.cursor()

    cursor.execute("INSERT into projects") # fix

    connection.close()

def delete_project(name):
    pass