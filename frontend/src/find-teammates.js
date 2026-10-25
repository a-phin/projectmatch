import './style.css';


let students = [];


const studentContainer =
    document.getElementById("student-container");


const searchInput =
    document.getElementById("teammate-search");


// LOAD STUDENTS FROM BACKEND

async function loadStudents() {

    studentContainer.innerHTML =
        "<p>Loading students...</p>";


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5001/api/users"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load students."
            );

        }


        const data =
            await response.json();


        students = data;


        displayStudents(students);


    } catch (error) {

        console.error(error);


        studentContainer.innerHTML = `

            <p>
                Could not load students.
                Make sure the backend is running.
            </p>

        `;

    }

}


// DISPLAY STUDENTS

function displayStudents(studentList) {

    studentContainer.innerHTML = "";


    studentList.forEach(student => {


        const skills =
            student.skills || [];


        const studentInterests =
            student.interests || [];


        const skillTags =
            skills
                .map(skill =>
                    `<span class="skill-tag">${skill}</span>`
                )
                .join("");


        const interests =
            studentInterests.length > 0
                ? studentInterests.join(" • ")
                : "No interests listed";


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

                        ${student.major || "Major not listed"}

                        ${student.year
                            ? ` • ${student.year}`
                            : ""
                        }

                    </p>

                </div>

            </div>


            <div class="student-section">

                <h3>
                    Skills
                </h3>

                <div class="skill-list">

                    ${
                        skillTags ||
                        "<span>No skills listed</span>"
                    }

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
                    ${
                        student.availability ||
                        "Not specified"
                    }
                    ${
                        student.availability
                            ? " hrs/week"
                            : ""
                    }
                </p>

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


// SEARCH

searchInput.addEventListener("input", () => {

    const searchText =
        searchInput
            .value
            .toLowerCase();


    const filteredStudents =
        students.filter(student => {


            const name =
                student.name || "";


            const major =
                student.major || "";


            const skills =
                student.skills || [];


            const interests =
                student.interests || [];


            const nameMatch =
                name
                    .toLowerCase()
                    .includes(searchText);


            const majorMatch =
                major
                    .toLowerCase()
                    .includes(searchText);


            const skillMatch =
                skills.some(skill =>
                    skill
                        .toLowerCase()
                        .includes(searchText)
                );


            const interestMatch =
                interests.some(interest =>
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


// LOAD STUDENTS WHEN PAGE OPENS

loadStudents();