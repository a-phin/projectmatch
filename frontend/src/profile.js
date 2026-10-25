import './style.css';


const profileForm =
    document.getElementById("profile-form");

const successMessage =
    document.getElementById("profile-success");


profileForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Save the profile on the account created during signup.

    const profile = {

        name:
            document.getElementById("student-name").value,

        major:
            document.getElementById("major").value,

        year:
            document.getElementById("year").value,

        skills:
            document
                .getElementById("skills")
                .value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== ""),

        interests:
            document
                .getElementById("interests")
                .value
                .split(",")
                .map(interest => interest.trim())
                .filter(interest => interest !== ""),

        availability:
            document.getElementById("availability").value

    };


    console.log("Sending Student Profile:", profile);


    try {

        const response =
            await fetch(
                "http://127.0.0.1:5001/api/me",
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(profile)
                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(
                errorData.error ||
                "Could not create profile."
            );

        }


        const createdUser =
            await response.json();


        console.log(
            "Student Profile Created:",
            createdUser
        );


        // SHOW SUCCESS ONLY AFTER SERVER SAVES USER

        successMessage.style.display =
            "block";


    } catch (error) {

        console.error(
            "Error creating profile:",
            error
        );


        successMessage.style.display =
            "none";


        alert(
            "Could not create profile. " +
            error.message
        );

    }

});
