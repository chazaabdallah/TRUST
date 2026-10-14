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

 
// =========================================
// TASK 10 - DOCUMENT MANAGEMENT
// =========================================

const documentUploadForm = document.getElementById("documentUploadForm");
const documentFile = document.getElementById("documentFile");
const documentMessage = document.getElementById("documentMessage");
const documentsList = document.getElementById("documentsList");
const refreshDocuments = document.getElementById("refreshDocuments");


// LOAD DOCUMENTS
async function loadDocuments() {
    try {
        const response = await fetch("/api/documents", {
            headers: { "x-auth-token": token }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load documents.");
        }

        documentsList.replaceChildren();

        if (!data.documents || data.documents.length === 0) {
            documentsList.textContent = "No documents uploaded yet.";
            return;
        }

        data.documents.forEach(doc => {
            const item = document.createElement("div");
            item.className = "info-row";

            const details = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = doc.original_name;

            const size = document.createElement("p");
            size.textContent = `${(doc.size / 1024).toFixed(1)} KB`;

            details.append(name, size);

            const downloadBtn = document.createElement("button");
            downloadBtn.type = "button";
            downloadBtn.className = "primary-btn";
            downloadBtn.textContent = "Download";

            downloadBtn.addEventListener("click", async () => {
                try {
                    const response = await fetch(
                        `/api/documents/${doc.id}/download`,
                        { headers: { "x-auth-token": token } }
                    );

                    if (!response.ok) {
                        throw new Error("Download failed.");
                    }

                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.href = url;
                    link.download = doc.original_name;
                    link.click();

                    URL.revokeObjectURL(url);
                } catch (error) {
                    alert(error.message);
                }
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "primary-btn";
            deleteBtn.textContent = "Delete";

            deleteBtn.addEventListener("click", async () => {
                if (!confirm(`Delete "${doc.original_name}"?`)) return;

                try {
                    const response = await fetch(
                        `/api/documents/${doc.id}`,
                        {
                            method: "DELETE",
                            headers: { "x-auth-token": token }
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || "Delete failed.");
                    }

                    loadDocuments();
                } catch (error) {
                    alert(error.message);
                }
            });

            item.append(details, downloadBtn, deleteBtn);
            documentsList.appendChild(item);
        });

    } catch (error) {
        documentsList.textContent = error.message;
    }
}


// UPLOAD DOCUMENT
documentUploadForm.addEventListener("submit", async event => {
    event.preventDefault();

    const file = documentFile.files[0];

    if (!file) {
        showMessage(documentMessage, "Please select a file.", true);
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showMessage(documentMessage, "Maximum file size is 5 MB.", true);
        return;
    }

    const formData = new FormData();
    formData.append("document", file);

    try {
        showMessage(documentMessage, "Uploading...", false);

        const response = await fetch("/api/documents", {
            method: "POST",
            headers: { "x-auth-token": token },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed.");
        }

        showMessage(documentMessage, "Document uploaded successfully!", false);
        documentUploadForm.reset();
        await loadDocuments();

    } catch (error) {
        showMessage(documentMessage, error.message, true);
    }
});


// REFRESH DOCUMENTS
refreshDocuments.addEventListener("click", loadDocuments);

// LOAD DOCUMENTS WHEN DASHBOARD OPENS
loadDocuments();
