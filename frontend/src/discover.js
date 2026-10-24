import './style.css';


const projects = [

    {
        id: 1,
        title: "FoodLoop",

        description:
            "Reduce food waste by connecting leftover campus food with students and community organizations.",

        category: "Community",

        skills: [
            "Python",
            "JavaScript",
            "UI/UX"
        ],

        members: 2,
        teamSize: 4,

        hours: "3-5",

        stage: "Prototype",

        match: 94
    },


    {
        id: 2,
        title: "PlantVision",

        description:
            "Use computer vision to help identify common plant diseases from photos.",

        category: "Research",

        skills: [
            "Python",
            "AI",
            "Biology"
        ],

        members: 3,
        teamSize: 5,

        hours: "4-6",

        stage: "Building",

        match: 87
    },


    {
        id: 3,
        title: "Campus Closet",

        description:
            "Create a student clothing exchange that makes donating and finding clothes easier.",

        category: "Community",

        skills: [
            "Marketing",
            "Design",
            "Web Development"
        ],

        members: 2,
        teamSize: 5,

        hours: "2-4",

        stage: "Idea",

        match: 82
    },


    {
        id: 4,
        title: "StoryMap",

        description:
            "Create an interactive map that shares stories from local businesses and community members.",

        category: "Creative",

        skills: [
            "Journalism",
            "Photography",
            "Web Design"
        ],

        members: 3,
        teamSize: 6,

        hours: "3-5",

        stage: "Prototype",

        match: 71
    },


    {
        id: 5,
        title: "StudySpot",

        description:
            "Help students find available study spaces based on location, noise level, and amenities.",

        category: "Technology",

        skills: [
            "JavaScript",
            "Python",
            "Data"
        ],

        members: 2,
        teamSize: 4,

        hours: "4-6",

        stage: "Building",

        match: 91
    }

];


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


// DISPLAY PROJECTS WHEN PAGE LOADS

displayProjects(projects);


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