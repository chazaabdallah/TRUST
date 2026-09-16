const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");


registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        const response = await fetch(
            "/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message || "Registration failed."
            );
        }


        registerMessage.textContent =
            "Account created successfully. Redirecting...";

        registerMessage.style.color =
            "#2d8a55";


        setTimeout(() => {

            window.location.href =
                "/login.html";

        }, 1000);


    } catch (error) {

        registerMessage.textContent =
            error.message;

        registerMessage.style.color =
            "#d64545";
    }

});