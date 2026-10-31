import './style.css';
import { escapeHtml } from './html.js';


// GET STUDENT ID FROM URL

const params =
    new URLSearchParams(window.location.search);

const studentId =
    params.get("id");


const container =
    document.getElementById(
        "student-profile-content"
    );


// LOAD STUDENT FROM BACKEND

async function loadStudent() {

    if (!studentId) {

        showNotFound();
        return;

    }


    container.innerHTML = `
        <p>Loading student...</p>
    `;


    try {

        const response =
            await fetch(
                `/api/users/${studentId}`
            );


        if (response.status === 404) {

            showNotFound();
            return;

        }


        if (!response.ok) {

            throw new Error(
                "Could not load student."
            );

        }


        const student =
            await response.json();


        displayStudent(student);


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <h1>
                Could not load student.
            </h1>

            <p>
                Make sure the backend is running.
            </p>

            <a href="find-teammates.html">
                Return to Find Teammates
            </a>

        `;

    }

}


// DISPLAY STUDENT

function displayStudent(student) {

    const skills =
        student.skills || [];


    const interests =
        student.interests || [];


    const skillTags =
        skills
            .map(skill =>
                `<span class="skill-tag">${escapeHtml(skill)}</span>`
            )
            .join("");


    const interestTags =
        interests
            .map(interest =>
                `<span class="interest-tag">${escapeHtml(interest)}</span>`
            )
            .join("");


    // CREATE INITIALS FOR AVATAR

    const initials =
        student.name
            .split(" ")
            .map(name => name[0])
            .join("");


    container.innerHTML = `

        <section class="student-profile-card">


            <div class="student-profile-header">


                <div class="student-avatar">

                    ${escapeHtml(initials)}

                </div>


                <div class="student-profile-name">

                    <h1>
                        ${escapeHtml(student.name)}
                    </h1>

                    <p>

                        ${escapeHtml(student.major || "Major not listed")}

                        ${
                            student.year
                                ? ` • ${escapeHtml(student.year)}`
                                : ""
                        }

                    </p>

                </div>


            </div>


            <hr>


            <div class="student-profile-section">

                <h2>
                    Skills
                </h2>

                <div class="skill-list">

                    ${
                        skillTags ||
                        "<span>No skills listed</span>"
                    }

                </div>

            </div>


            <div class="student-profile-section">

                <h2>
                    Interests
                </h2>

                <div class="interest-list">

                    ${
                        interestTags ||
                        "<span>No interests listed</span>"
                    }

                </div>

            </div>


            <div class="student-profile-section">

                <h2>
                    Availability
                </h2>

                <p>

                    ${
                        student.availability
                            ? `⏱ ${escapeHtml(student.availability)} hours/week`
                            : "Not specified"
                    }

                </p>

            </div>


            <button
                type="button"
                id="invite-button"
                class="primary-button invite-button"
            >

                Invite to Project

            </button>


            <div
                id="invite-message"
                class="success-message"
            >

                Invitation sent!

            </div>


        </section>

    `;


    // INVITE BUTTON

    const inviteButton =
        document.getElementById(
            "invite-button"
        );


    const inviteMessage =
        document.getElementById(
            "invite-message"
        );


    inviteButton.addEventListener(
        "click",
        () => {

            inviteMessage.style.display =
                "block";


            inviteButton.textContent =
                "Invitation Sent";


            inviteButton.disabled =
                true;

        }
    );

}


// STUDENT NOT FOUND

function showNotFound() {

    container.innerHTML = `

        <h1>
            Student not found.
        </h1>

        <a href="find-teammates.html">
            Return to Find Teammates
        </a>

    `;

}


// LOAD STUDENT WHEN PAGE OPENS

loadStudent();
