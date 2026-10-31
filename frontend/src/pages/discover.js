import './style.css';
import { loadAccountNav } from './auth-nav.js';
import { escapeHtml } from './html.js';

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

        const skillTags = (project.skills || [])
            .map(skill =>
                `<span class="skill-tag">${escapeHtml(skill)}</span>`
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
                    ${escapeHtml(project.category)}
                </span>

                <span class="match-score">
                    ${project.match == null ? "Sign in for match" : `${escapeHtml(project.match)}% Match`}
                </span>

            </div>


            <h2>
                ${escapeHtml(project.title)}
            </h2>


            <div class="team-status ${statusClass}">

                <span class="status-dot"></span>

                ${teamStatus}

            </div>


            <p class="project-description">
                ${escapeHtml(project.description)}
            </p>


            <div class="skill-list">

                ${skillTags}

            </div>


            <div class="project-details">

                <span>
                    👥 ${escapeHtml(project.members)}/${escapeHtml(project.teamSize)}
                </span>

                <span>
                    ⏱ ${escapeHtml(project.hours)} hrs/week
                </span>

                <span>
                    ${escapeHtml(project.stage)}
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

        const projectsResponse = await fetch(
            "/api/projects"
        );


        if (!projectsResponse.ok) {
            throw new Error(
                "Could not load projects."
            );
        }


        const projectData =
            await projectsResponse.json();

        // Matching is optional for visitors; signed-in students get
        // personalized scores from the session-backed endpoint.
        let matchData = [];
        try {
            const matchesResponse = await fetch(
                "/api/me/matches",
                { credentials: "include" }
            );
            if (matchesResponse.ok) {
                matchData = await matchesResponse.json();
            }
        } catch (error) {
            console.warn("Could not load personalized matches:", error);
        }


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
                    project.min_hours == null
                        ? "Not specified"
                        : project.max_hours == null
                            ? `${project.min_hours}+`
                            : `${project.min_hours}-${project.max_hours}`,

                stage:
                    project.stage || "Building",

                match:
                    match ? match.score : null,

                matchBreakdown:
                    match
                        ? match.breakdown
                        : null

            };

        });


        // Sort highest match first

        projects.sort(
            (a, b) =>
            (b.match ?? -1) - (a.match ?? -1)
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
