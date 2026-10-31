import './style.css';


const loginForm =
    document.getElementById("login-form");

const errorMessage =
    document.getElementById("login-error");


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        errorMessage.style.display =
            "none";


        const loginData = {

            username:
                document
                    .getElementById("username")
                    .value
                    .trim(),

            password:
                document
                    .getElementById("password")
                    .value

        };


        try {

            const response =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(loginData)
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Could not log in."
                );

            }


            console.log(
                "Logged in:",
                data
            );


            // Send user to Discover
            window.location.href =
                "discover.html";


        } catch (error) {

            console.error(error);

            errorMessage.textContent =
                error.message;

            errorMessage.style.display =
                "block";

        }

    }
);
