// =========================================
// AUTHENTICATION CHECK
// =========================================

if (
    sessionStorage.getItem("userAuthenticated") !== "true"
) {
    window.location.href = "/login.html";
}


const token =
    sessionStorage.getItem("userToken");


// =========================================
// ELEMENTS
// =========================================

const headerName =
    document.getElementById("headerName");

const userAvatar =
    document.getElementById("userAvatar");

const displayName =
    document.getElementById("displayName");

const displayEmail =
    document.getElementById("displayEmail");

const displayDate =
    document.getElementById("displayDate");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileForm =
    document.getElementById("profileForm");

const profileMessage =
    document.getElementById("profileMessage");

const passwordForm =
    document.getElementById("passwordForm");

const passwordMessage =
    document.getElementById("passwordMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================
// LOAD USER FROM BACKEND
// =========================================

async function loadUser() {

    try {

        const response = await fetch(
            "/api/auth/me",
            {
                method: "GET",

                headers: {
                    "x-auth-token": token
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


        const user = data.user;


        // Header

        headerName.textContent =
            user.name;


        userAvatar.textContent =
            user.name
                .charAt(0)
                .toUpperCase();


        // Account information

        displayName.textContent =
            user.name;

        displayEmail.textContent =
            user.email;


        // Date

        if (user.created_at) {

            const date =
                new Date(user.created_at);

            displayDate.textContent =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                );
        }


        // Form values

        profileName.value =
            user.name;

        profileEmail.value =
            user.email;


    } catch (error) {

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


// =========================================
// UPDATE PROFILE
// =========================================

profileForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            profileName.value.trim();

        const email =
            profileEmail.value.trim();


        if (!name || !email) {

            showMessage(
                profileMessage,
                "Name and email are required.",
                true
            );

            return;
        }


        try {

            const response = await fetch(
                "/api/auth/me",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-auth-token":
                            token
                    },

                    body: JSON.stringify({
                        name,
                        email
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update profile."
                );
            }


            showMessage(
                profileMessage,
                "Profile updated successfully.",
                false
            );


            // Refresh displayed information

            await loadUser();


        } catch (error) {

            showMessage(
                profileMessage,
                error.message,
                true
            );
        }
    }
);


// =========================================
// UPDATE PASSWORD
// =========================================

passwordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const currentPassword =
            document
                .getElementById("currentPassword")
                .value;

        const newPassword =
            document
                .getElementById("newPassword")
                .value;


        if (!currentPassword || !newPassword) {

            showMessage(
                passwordMessage,
                "Please enter both passwords.",
                true
            );

            return;
        }


        if (newPassword.length < 8) {

            showMessage(
                passwordMessage,
                "New password must be at least 8 characters.",
                true
            );

            return;
        }


        try {

            const response = await fetch(
                "/api/auth/me",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-auth-token":
                            token
                    },

                    body: JSON.stringify({

                        name:
                            profileName.value.trim(),

                        email:
                            profileEmail.value.trim(),

                        currentPassword,

                        newPassword

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update password."
                );
            }


            showMessage(
                passwordMessage,
                "Password updated successfully.",
                false
            );


            passwordForm.reset();


        } catch (error) {

            showMessage(
                passwordMessage,
                error.message,
                true
            );
        }
    }
);


// =========================================
// LOGOUT
// =========================================

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
                            token
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


// =========================================
// FEEDBACK
// =========================================

function showMessage(
    element,
    message,
    isError
) {

    element.textContent =
        message;

    element.classList.toggle(
        "error",
        isError
    );

    element.classList.toggle(
        "success",
        !isError
    );
}


// =========================================
// LOAD DASHBOARD
// =========================================

loadUser();