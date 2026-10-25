import './style.css';
import { escapeHtml } from './html.js';


// GET PROJECT ID FROM URL

const params =
    new URLSearchParams(window.location.search);

const projectId =
    params.get("id");


const container =
    document.getElementById("project-content");


// LOAD PROJECT FROM BACKEND

async function loadProject() {

    if (!projectId) {
        showNotFound();
        return;
    }

    container.innerHTML = `
        <p>Loading project...</p>
    `;

    try {

        const projectResponse = await fetch(
            `/api/projects/${projectId}`
        );


        if (projectResponse.status === 404) {
            showNotFound();
            return;
        }


        if (!projectResponse.ok) {
            throw new Error(
                "Could not load project."
            );
        }


        const data =
            await projectResponse.json();

        let matches = [];
        try {
            const matchesResponse = await fetch(
                "/api/me/matches",
                { credentials: "include" }
            );
            if (matchesResponse.ok) {
                matches = await matchesResponse.json();
            }
        } catch (error) {
            console.warn("Could not load personalized matches:", error);
        }


        // Find the match result for this project

        const matchResult =
            matches.find(
                match =>
                    match.project_id ===
                    Number(projectId)
            );


        const project = {

            ...data,

            members:
                data.current_team_amount,

            teamSize:
                data.max_team_amount,

            hours:
                data.min_hours == null
                    ? "Not specified"
                    : data.max_hours == null
                        ? `${data.min_hours}+`
                        : `${data.min_hours}-${data.max_hours}`,

            stage:
                data.stage || "Building",

            match:
                matchResult
                    ? matchResult.score
                    : null,

            matchBreakdown:
                matchResult
                    ? matchResult.breakdown
                    : null,

            about:
                data.about ||
                data.description,

            lookingFor:
                data.looking_for || []

        };


        displayProject(project);


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <h1>
                Could not load project.
            </h1>

            <p>
                Make sure the backend is running.
            </p>

            <a href="discover.html">
                Return to Discover
            </a>
        `;

    }

}


// DISPLAY PROJECT

function displayProject(project) {

    const skills =
        project.skills || [];


    const skillTags = skills
        .map(skill =>
            `<span class="skill-tag">${escapeHtml(skill)}</span>`
        )
        .join("");


    const roles =
        project.lookingFor
            .map(role =>
                `<li>${escapeHtml(role)}</li>`
            )
            .join("");


    let teamStatus = "";
    let statusClass = "";


    const spotsLeft =
        project.teamSize - project.members;


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
                        ${escapeHtml(project.category)}
                    </span>

                    <h1>
                        ${escapeHtml(project.title)}
                    </h1>

                </div>


                <div class="large-match-score">

                    <strong>
                        ${project.match == null ? "—" : `${escapeHtml(project.match)}%`}
                    </strong>

                    <span>
                        Match
                    </span>

                </div>

            </div>


            <p class="project-lead">
                ${escapeHtml(project.description)}
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
                    👥 ${escapeHtml(project.members)}/${escapeHtml(project.teamSize)}
                </span>

                <span>
                    ⏱ ${escapeHtml(project.hours)} hrs/week
                </span>

                <span>
                    🔨 ${escapeHtml(project.stage)}
                </span>

            </div>


            <hr>


            <h2>
                About the Project
            </h2>

            <p class="project-about">
                ${escapeHtml(project.about)}
            </p>


            <h2>
                We're Looking For
            </h2>


            <ul class="role-list">
                ${
                    roles ||
                    "<li>No specific roles listed yet.</li>"
                }
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

        joinMessage.style.display =
            "block";

        joinButton.textContent =
            "Request Sent";

        joinButton.disabled =
            true;

    });

}


// PROJECT NOT FOUND

function showNotFound() {

    container.innerHTML = `

        <h1>Project not found.</h1>

        <a href="discover.html">
            Return to Discover
        </a>

    `;

}


// LOAD PROJECT WHEN PAGE OPENS

loadProject();
