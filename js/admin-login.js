const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Login failed."
            );
        }
        sessionStorage.setItem(
    "adminAuthenticated",
    "true"
);

sessionStorage.setItem(
    "adminToken",
    data.token
);

window.location.href = "/admin.html";

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = "#d64545";
    }
});