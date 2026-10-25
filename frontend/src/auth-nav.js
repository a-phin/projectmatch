import { escapeHtml } from './html.js';

export async function loadAccountNav() {

    const authNav =
        document.getElementById("auth-nav");

    if (!authNav) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/me",
                {
                    credentials: "include"
                }
            );

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

        const user =
            await response.json();

        const displayName = user.name || user.username || "Student";

        const initial =
            displayName
                .charAt(0)
                .toUpperCase();

        authNav.innerHTML = `
            <a href="post-project.html">
                Post a Project
            </a>

            <a
                href="profile.html"
                class="account-avatar"
                title="${escapeHtml(displayName)}"
            >
                ${escapeHtml(initial)}
            </a>
        `;

    } catch (error) {

        console.error(
            "Could not check login:",
            error
        );

        authNav.innerHTML = `
            <a href="login.html">
                Login
            </a>

            <a href="signup.html">
                Sign Up
            </a>
        `;
    }
}
