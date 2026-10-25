import './style.css';


const signupForm =
    document.getElementById("signup-form");

const errorMessage =
    document.getElementById("signup-error");


signupForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        errorMessage.style.display =
            "none";


        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;

        const confirmPassword =
            document
                .getElementById(
                    "confirm-password"
                )
                .value;


        if (password !== confirmPassword) {

            errorMessage.textContent =
                "Passwords do not match.";

            errorMessage.style.display =
                "block";

            return;

        }


        const signupData = {
            username,
            password
        };


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5001/api/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(signupData)
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Could not create account."
                );

            }


            console.log(
                "Account created:",
                data
            );


            // Signup automatically logs them in.
            // Send them to complete their profile.

            window.location.href =
                "profile.html";


        } catch (error) {

            console.error(error);

            errorMessage.textContent =
                error.message;

            errorMessage.style.display =
                "block";

        }

    }
);