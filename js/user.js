if (
    sessionStorage.getItem("userAuthenticated")
    !== "true"
) {
    window.location.href = "/login.html";
}


const userInfo =
    document.getElementById("userInfo");

const logoutBtn =
    document.getElementById("logoutBtn");


async function loadUser() {

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                headers: {
                    "x-auth-token":
                        sessionStorage.getItem("userToken")
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load account."
            );
        }


        userInfo.innerHTML = `
            <strong>${escapeHTML(data.user.name)}</strong>
            <br>
            ${escapeHTML(data.user.email)}
        `;


    } catch (error) {

        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("userAuthenticated");

        window.location.href =
            "/login.html";
    }
}


logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",

                    headers: {
                        "x-auth-token":
                            sessionStorage.getItem("userToken")
                    }
                }
            );

        } finally {

            sessionStorage.removeItem(
                "userToken"
            );

            sessionStorage.removeItem(
                "userAuthenticated"
            );

            window.location.href =
                "/login.html";
        }
    }
);


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


loadUser();