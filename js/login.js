const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Login failed."
            );
        }


        sessionStorage.setItem(
            "userToken",
            data.token
        );


        sessionStorage.setItem(
            "userAuthenticated",
            "true"
        );


        window.location.href =
            "/user.html";


    } catch (error) {

        loginMessage.textContent =
            error.message;

        loginMessage.style.color =
            "#d64545";
    }

});