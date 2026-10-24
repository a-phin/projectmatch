import './style.css';


const projects = [

    {
        id: 1,

        title: "FoodLoop",

        description:
            "Reduce food waste by connecting leftover campus food with students and community organizations.",

        category: "Community",

        stage: "Prototype",

        match: 94,

        members: 2,

        teamSize: 4,

        hours: "3-5",

        skills: [
            "Python",
            "JavaScript",
            "UI/UX"
        ],

        about:
            "Student organizations frequently have leftover food after meetings and events. FoodLoop helps connect that surplus food with people and organizations that can use it before it goes to waste.",

        lookingFor: [
            "Frontend Developer",
            "UI/UX Designer"
        ]
    },


    {
        id: 2,

        title: "PlantVision",

        description:
            "Use computer vision to identify common plant diseases.",

        category: "Research",

        stage: "Building",

        match: 87,

        members: 3,

        teamSize: 5,

        hours: "4-6",

        skills: [
            "Python",
            "AI",
            "Biology"
        ],

        about:
            "PlantVision explores how computer vision can help identify common plant diseases from images and make early detection more accessible.",

        lookingFor: [
            "Biology Student",
            "Frontend Developer"
        ]
    }

];

const params =
    new URLSearchParams(window.location.search);

const projectId =
    Number(params.get("id"));


const project =
    projects.find(project => project.id === projectId);

const container =
    document.getElementById("project-content");


if (project) {

    const skillTags = project.skills
        .map(skill =>
            `<span class="skill-tag">${skill}</span>`
        )
        .join("");


    const roles = project.lookingFor
        .map(role =>
            `<li>${role}</li>`
        )
        .join("");


    let teamStatus = "";
    let statusClass = "";

    const spotsLeft = project.teamSize - project.members;

    if (spotsLeft <= 0) {
        teamStatus = "Team Full";
        statusClass = "status-full";
    } else if (spotsLeft === 1) {
        teamStatus = "1 Spot Left";
        statusClass = "status-limited";
    } else {
        teamStatus = "Looking for Teammates";
        statusClass = "status-open";
    }


    container.innerHTML = `

        <section class="project-main">

            <div class="project-title-row">

                <div>

                    <span class="project-category">
                        ${project.category}
                    </span>

                    <h1>${project.title}</h1>

                </div>


                <div class="large-match-score">

                    <strong>
                        ${project.match}%
                    </strong>

                    <span>
                        Match
                    </span>

                </div>

            </div>


            <p class="project-lead">
                ${project.description}
            </p>
            
            <div class="team-status ${statusClass}">
                <span class="status-dot"></span>
                ${teamStatus}
            </div>


            <div class="skill-list">
                ${skillTags}
            </div>


            <div class="project-meta">

                <span>
                    👥 ${project.members}/${project.teamSize}
                </span>

                <span>
                    ⏱ ${project.hours} hrs/week
                </span>

                <span>
                    🔨 ${project.stage}
                </span>

            </div>


            <hr>


            <h2>About the Project</h2>

            <p class="project-about">
                ${project.about}
            </p>


            <h2>We're Looking For</h2>

            <ul class="role-list">
                ${roles}
            </ul>


            <button
                type="button"
                id="join-button"
                class="primary-button join-button">

                Request to Join

            </button>


            <div
                id="join-message"
                class="success-message">

                Request sent to the project owner!

            </div>

        </section>

    `;

    // REQUEST TO JOIN

    const joinButton =
        document.getElementById("join-button");

    const joinMessage =
        document.getElementById("join-message");


    joinButton.addEventListener("click", () => {

        joinMessage.style.display = "block";

        joinButton.textContent =
            "Request Sent";

        joinButton.disabled = true;

    });

} else {

    container.innerHTML = `
        <h1>Project not found.</h1>

        <a href="discover.html">
            Return to Discover
        </a>
    `;

}