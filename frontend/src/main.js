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

// ACCOUNT NAVIGATION

const authNav =
    document.getElementById("auth-nav");


async function loadAccountNav() {

    if (!authNav) {
        return;
    }

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5001/api/me",
                {
                    credentials: "include"
                }
            );


        // USER IS NOT LOGGED IN

        if (!response.ok) {

            authNav.innerHTML = `
                <a href="login.html">
                    Login
                </a>

                <a
                    href="signup.html"
                    class="signup-nav-button"
                >
                    Sign Up
                </a>
            `;

            return;
        }


        // USER IS LOGGED IN

        const user =
            await response.json();


        const initial =
            (user.name || user.username)
                .charAt(0)
                .toUpperCase();


        authNav.innerHTML = `
            <a href="post-project.html">
                Post a Project
            </a>

            <a
                href="profile.html"
                class="account-avatar"
                title="${user.name || user.username}"
            >
                ${initial}
            </a>
        `;


    } catch (error) {

        console.error(
            "Could not check login:",
            error
        );


        // If backend cannot be reached,
        // show login/signup instead.

        authNav.innerHTML = `
            <a href="login.html">
                Login
            </a>

            <a
                href="signup.html"
                class="signup-nav-button"
            >
                Sign Up
            </a>
        `;

    }

}


loadAccountNav();
