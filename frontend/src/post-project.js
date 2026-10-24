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

form.addEventListener("submit", (event) => {

    event.preventDefault();


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
                .map(skill => skill.trim()),

        teamSize:
            Number(
                document.getElementById("team-size").value
            ),

        hours:
            document.getElementById("hours").value,

        about:
            document.getElementById("project-about").value,

        lookingFor:
            document
                .getElementById("roles-needed")
                .value
                .split(",")
                .map(role => role.trim()),

        members: 1

    };


    console.log("New Project:", project);


    successMessage.style.display = "block";


    form.reset();

});