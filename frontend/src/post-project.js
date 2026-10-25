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
    // Example: "3-5" becomes minHours = 3, maxHours = 5

    const hoursValue =
        document.getElementById("hours").value;

    const hoursParts =
        hoursValue.split("-");

    const minHours =
        Number(hoursParts[0]);

    const maxHours =
        Number(hoursParts[1]);


    // CREATE PROJECT USING BACKEND FIELD NAMES

    const project = {

        title:
            document.getElementById("project-title").value,

        description:
            document.getElementById("project-description").value,

        category:
            document.getElementById("project-category").value,

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
            maxHours

    };


    console.log("Sending Project:", project);


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5001/api/projects",
                {
                    method: "POST",

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