import './style.css';


const profileForm =
    document.getElementById("profile-form");

const successMessage =
    document.getElementById("profile-success");


async function loadProfile() {
    try {
        const response = await fetch("/api/me", {
            credentials: "include"
        });
        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }
        if (!response.ok) throw new Error("Could not load your profile.");

        const user = await response.json();
        document.getElementById("student-name").value = user.name || "";
        document.getElementById("major").value = user.major || "";
        document.getElementById("year").value = user.year || "";
        document.getElementById("skills").value = (user.skills || []).join(", ");
        document.getElementById("interests").value = (user.interests || []).join(", ");
        document.getElementById("learning").value = (user.skills_to_learn || []).join(", ");
        document.getElementById("availability").value = user.availability || "";
        document.getElementById("looking-for").value = user.looking_for || "Both";
    } catch (error) {
        console.error("Could not load profile:", error);
        alert(error.message);
    }
}


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

        skills_to_learn:
            document
                .getElementById("learning")
                .value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== ""),

        availability:
            document.getElementById("availability").value,

        looking_for:
            document.getElementById("looking-for").value

    };


    console.log("Sending Student Profile:", profile);


    try {

        const response =
            await fetch(
                "/api/me",
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
                "Could not update profile."
            );

        }


        const createdUser =
            await response.json();


        console.log(
            "Student Profile Updated:",
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
            "Could not update profile. " +
            error.message
        );

    }

});


loadProfile();
