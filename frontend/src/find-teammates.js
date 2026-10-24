import './style.css';

import { students } from './data/students.js';


const studentContainer =
    document.getElementById("student-container");


const searchInput =
    document.getElementById("teammate-search");


// DISPLAY STUDENTS

function displayStudents(studentList) {

    studentContainer.innerHTML = "";


    studentList.forEach(student => {


        const skillTags =
            student.skills
                .map(skill =>
                    `<span class="skill-tag">${skill}</span>`
                )
                .join("");


        const interests =
            student.interests.join(" • ");


        const matchReasons =
            student.reasons
                .map(reason =>
                    `<li>✓ ${reason}</li>`
                )
                .join("");


        const card =
            document.createElement("article");


        card.className =
            "student-card";


        card.innerHTML = `

            <div class="student-card-header">

                <div>

                    <h2>
                        ${student.name}
                    </h2>

                    <p class="student-major">

                        ${student.major}
                        •
                        ${student.year}

                    </p>

                </div>


                <div class="student-match">

                    ${student.match}% Match

                </div>

            </div>


            <div class="student-section">

                <h3>
                    Skills
                </h3>

                <div class="skill-list">

                    ${skillTags}

                </div>

            </div>


            <div class="student-section">

                <h3>
                    Interested In
                </h3>

                <p>
                    ${interests}
                </p>

            </div>


            <div class="student-section">

                <h3>
                    Availability
                </h3>

                <p>
                    ${student.availability} hrs/week
                </p>

            </div>


            <div class="match-reasons">

                <h3>
                    Why they match
                </h3>

                <ul>
                    ${matchReasons}
                </ul>

            </div>


            <button
                type="button"
                class="view-profile-button"
                data-id="${student.id}"
            >

                View Profile

            </button>

        `;


        studentContainer.appendChild(card);

    });

}


// DISPLAY EVERYONE INITIALLY

displayStudents(students);


// SEARCH

searchInput.addEventListener("input", () => {

    const searchText =
        searchInput
            .value
            .toLowerCase();


    const filteredStudents =
        students.filter(student => {


            const nameMatch =
                student.name
                    .toLowerCase()
                    .includes(searchText);


            const majorMatch =
                student.major
                    .toLowerCase()
                    .includes(searchText);


            const skillMatch =
                student.skills.some(skill =>
                    skill
                        .toLowerCase()
                        .includes(searchText)
                );


            const interestMatch =
                student.interests.some(interest =>
                    interest
                        .toLowerCase()
                        .includes(searchText)
                );


            return (
                nameMatch ||
                majorMatch ||
                skillMatch ||
                interestMatch
            );

        });


    displayStudents(filteredStudents);

});

// VIEW STUDENT PROFILE

studentContainer.addEventListener(
    "click",
    (event) => {

        if (
            event.target.classList.contains(
                "view-profile-button"
            )
        ) {

            const studentId =
                event.target.dataset.id;


            window.location.href =
                `./student-profile.html?id=${studentId}`;

        }

    }
);