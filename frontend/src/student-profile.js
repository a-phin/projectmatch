import './style.css';

import { students } from './data/students.js';


// GET STUDENT ID FROM URL

const params =
    new URLSearchParams(window.location.search);

const studentId =
    Number(params.get("id"));


// FIND STUDENT

const student =
    students.find(student =>
        student.id === studentId
    );


const container =
    document.getElementById(
        "student-profile-content"
    );


// DISPLAY STUDENT

if (student) {

    const skillTags =
        student.skills
            .map(skill =>
                `<span class="skill-tag">${skill}</span>`
            )
            .join("");


    const interestTags =
        student.interests
            .map(interest =>
                `<span class="interest-tag">${interest}</span>`
            )
            .join("");


    const matchReasons =
        student.reasons
            .map(reason =>
                `<li>✓ ${reason}</li>`
            )
            .join("");


    container.innerHTML = `

        <section class="student-profile-card">


            <div class="student-profile-header">


                <div class="student-avatar">

                    ${student.name
                        .split(" ")
                        .map(name => name[0])
                        .join("")}

                </div>


                <div class="student-profile-name">

                    <h1>
                        ${student.name}
                    </h1>

                    <p>
                        ${student.major}
                        •
                        ${student.year}
                    </p>

                </div>


                <div class="large-match-score">

                    <strong>
                        ${student.match}%
                    </strong>

                    <span>
                        Match
                    </span>

                </div>


            </div>


            <hr>


            <div class="student-profile-section">

                <h2>
                    Skills
                </h2>

                <div class="skill-list">

                    ${skillTags}

                </div>

            </div>


            <div class="student-profile-section">

                <h2>
                    Interests
                </h2>

                <div class="interest-list">

                    ${interestTags}

                </div>

            </div>


            <div class="student-profile-section">

                <h2>
                    Availability
                </h2>

                <p>
                    ⏱ ${student.availability} hours/week
                </p>

            </div>


            <div class="profile-match-reasons">

                <h2>
                    Why ${student.name} could be a good teammate
                </h2>

                <ul>

                    ${matchReasons}

                </ul>

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
        document.getElementById("invite-button");


    const inviteMessage =
        document.getElementById("invite-message");


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


} else {

    container.innerHTML = `

        <h1>
            Student not found.
        </h1>

        <a href="find-teammates.html">
            Return to Find Teammates
        </a>

    `;

}