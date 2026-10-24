import './style.css';


const profileForm =
    document.getElementById("profile-form");

const successMessage =
    document.getElementById("profile-success");


profileForm.addEventListener("submit", (event) => {

    event.preventDefault();


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
                .map(skill => skill.trim()),

        interests:
            document
                .getElementById("interests")
                .value
                .split(",")
                .map(interest => interest.trim()),

        learning:
            document
                .getElementById("learning")
                .value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== ""),

        availability:
            document.getElementById("availability").value,

        lookingFor:
            document.getElementById("looking-for").value

    };


    console.log("Student Profile:", profile);


    successMessage.style.display = "block";

});