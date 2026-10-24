import './style.css';


const findProjectButton =
    document.getElementById("find-project");

const postProjectButton =
    document.getElementById("post-project");


findProjectButton.addEventListener("click", () => {

    window.location.href = "discover.html";

});


postProjectButton.addEventListener("click", () => {

    window.location.href = "post-project.html";

});