import './style.css';
import { loadAccountNav } from './auth-nav.js';

loadAccountNav();


let projects = [];


// DISPLAY PROJECTS

function displayProjects(projectList) {

    const container =
        document.getElementById("project-container");

    container.innerHTML = "";


    projectList.forEach(project => {

        const card =
            document.createElement("article");

        card.className = "project-card";


        // CREATE SKILL TAGS

        const skillTags = project.skills
            .map(skill =>
                `<span class="skill-tag">${skill}</span>`
            )
            .join("");


        // DETERMINE TEAM STATUS

        let teamStatus = "";
        let statusClass = "";


        if (project.members >= project.teamSize) {

            teamStatus = "Team Full";
            statusClass = "status-full";

        } else if (
            project.teamSize - project.members === 1
        ) {

            teamStatus = "1 Spot Left";
            statusClass = "status-limited";

        } else {

            teamStatus = "Looking for Teammates";
            statusClass = "status-open";

        }


        // CREATE PROJECT CARD

        card.innerHTML = `

            <div class="project-card-header">

                <span class="project-category">
                    ${project.category}
                </span>

                <span class="match-score">
                    ${project.match}% Match
                </span>

            </div>


            <h2>
                ${project.title}
            </h2>


            <div class="team-status ${statusClass}">

                <span class="status-dot"></span>

                ${teamStatus}

            </div>


            <p class="project-description">
                ${project.description}
            </p>


            <div class="skill-list">

                ${skillTags}

            </div>


            <div class="project-details">

                <span>
                    👥 ${project.members}/${project.teamSize}
                </span>

                <span>
                    ⏱ ${project.hours} hrs/week
                </span>

                <span>
                    ${project.stage}
                </span>

            </div>


            <button
                type="button"
                class="view-project-button"
                data-id="${project.id}">

                View Project

            </button>

        `;


        container.appendChild(card);

    });

}


// LOAD PROJECTS FROM BACKEND

async function loadProjects() {

    const container =
        document.getElementById("project-container");

    container.innerHTML =
        "<p>Loading projects...</p>";

    try {

        // For the hackathon demo, User 1 is the current user
        const currentUserId = 1;


        // Get projects and matches at the same time
        const [
            projectsResponse,
            matchesResponse
        ] = await Promise.all([

            fetch(
                "http://127.0.0.1:5001/api/projects"
            ),

            fetch(
                `http://127.0.0.1:5001/api/users/${currentUserId}/matches`
            )

        ]);


        if (!projectsResponse.ok) {
            throw new Error(
                "Could not load projects."
            );
        }


        if (!matchesResponse.ok) {
            throw new Error(
                "Could not load project matches."
            );
        }


        const projectData =
            await projectsResponse.json();

        const matchData =
            await matchesResponse.json();


        // Create a lookup:
        // project ID -> matching result

        const matchMap = {};

        matchData.forEach(match => {

            matchMap[match.project_id] =
                match;

        });


        // Combine project information
        // with matching information

        projects = projectData.map(project => {

            const match =
                matchMap[project.id];

            return {

                ...project,

                members:
                    project.current_team_amount,

                teamSize:
                    project.max_team_amount,

                hours:
                    `${project.min_hours}-${project.max_hours}`,

                stage:
                    project.stage || "Building",

                match:
                    match
                        ? match.score
                        : 0,

                matchBreakdown:
                    match
                        ? match.breakdown
                        : null

            };

        });


        // Sort highest match first

        projects.sort(
            (a, b) =>
                b.match - a.match
        );


        displayProjects(projects);


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Could not load projects.
                Make sure the backend is running.
            </p>
        `;

    }

}

loadProjects();


// VIEW PROJECT BUTTON

document
    .getElementById("project-container")
    .addEventListener("click", (event) => {

        if (
            event.target.classList.contains(
                "view-project-button"
            )
        ) {

            const projectId =
                event.target.dataset.id;


            window.location.href =
                `./project.html?id=${projectId}`;

        }

    });

// SEARCH PROJECTS

const searchInput =
    document.getElementById("project-search");


searchInput.addEventListener("input", () => {

    const searchText =
        searchInput.value.toLowerCase();


    const filteredProjects =
        projects.filter(project => {

            const titleMatch =
                project.title
                    .toLowerCase()
                    .includes(searchText);


            const descriptionMatch =
                project.description
                    .toLowerCase()
                    .includes(searchText);


            const skillMatch =
                project.skills.some(skill =>
                    skill
                        .toLowerCase()
                        .includes(searchText)
                );


            return (
                titleMatch ||
                descriptionMatch ||
                skillMatch
            );

        });


    displayProjects(filteredProjects);

});

// CATEGORY FILTERS

const filterButtons =
    document.querySelectorAll(".filter-button");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active style from every button

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );


        // Add active style to clicked button

        button.classList.add("active");


        const category =
            button.dataset.category;


        // Show everything if All is selected

        if (category === "All") {

            displayProjects(projects);

        } else {

            const filteredProjects =
                projects.filter(project =>
                    project.category === category
                );


            displayProjects(filteredProjects);

        }

    });

});