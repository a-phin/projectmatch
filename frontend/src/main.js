import './style.css';
import { loadAccountNav } from './auth-nav.js';

document.getElementById("find-project")?.addEventListener("click", () => {
    window.location.href = "discover.html";
});

document.getElementById("post-project")?.addEventListener("click", () => {
    window.location.href = "post-project.html";
});

loadAccountNav();
