import './style.css';


const form =
    document.getElementById("project-form");

const successMessage =
    document.getElementById("success-message");


// TEAM SIZE INPUT

const teamSizeInput =
    document.getElementById("team-size");


teamSizeInput.addEventListener("blur", () => {

    let teamSize =
        Number(teamSizeInput.value);


    // If empty, reset to minimum team size
    if (teamSizeInput.value === "") {

        teamSizeInput.value = 2;

    }

    // If below 2, reset to 2
    else if (teamSize < 2) {

        teamSizeInput.value = 2;

    }

    // If above 20, reset to 20
    else if (teamSize > 20) {

        teamSizeInput.value = 20;

    }

});


// FORM SUBMISSION

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    // GET HOURS AND SPLIT THEM
    // A value like "9+" is stored as a minimum of 9 with no upper bound.

    const hoursValue =
        document.getElementById("hours").value;

    const hoursParts = hoursValue.split("-");
    const minHours = Number(hoursParts[0].replace("+", ""));
    const maxHours = hoursValue.endsWith("+")
        ? null
        : Number(hoursParts[1]);


    // CREATE PROJECT USING BACKEND FIELD NAMES

    const project = {

        title:
            document.getElementById("project-title").value,

        description:
            document.getElementById("project-description").value,

        category:
            document.getElementById("project-category").value,

        stage:
            document.getElementById("project-stage").value,

        skills:
            document
                .getElementById("project-skills")
                .value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== ""),

        current_team_amount: 1,

        max_team_amount:
            Number(
                document.getElementById("team-size").value
            ),

        min_hours:
            minHours,

        max_hours:
            maxHours,

        about:
            document.getElementById("project-about").value,

        looking_for:
            document
                .getElementById("roles-needed")
                .value
                .split(",")
                .map(role => role.trim())
                .filter(role => role !== "")

    };


    console.log("Sending Project:", project);


    try {

        const response =
            await fetch(
                "/api/projects",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(project)
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(
                errorData.error ||
                "Could not create project."
            );

        }


        const createdProject =
            await response.json();


        console.log(
            "Project Created:",
            createdProject
        );


        // ONLY SHOW SUCCESS IF BACKEND SUCCEEDED

        successMessage.style.display =
            "block";


        form.reset();


    } catch (error) {

        console.error(
            "Error creating project:",
            error
        );


        successMessage.style.display =
            "none";


        alert(
            "Could not create project. " +
            error.message
        );

    }

});
