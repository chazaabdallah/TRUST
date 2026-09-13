if (sessionStorage.getItem("adminAuthenticated") !== "true") {
    window.location.href = "/admin-login.html";
}

const contentForm = document.getElementById("contentForm");
const contentList = document.getElementById("contentList");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formMessage = document.getElementById("formMessage");
const logoutBtn = document.getElementById("logoutBtn");

let editingId = null;

// ==============================
// LOAD CONTENT
// ==============================

async function loadContent() {
    try {
        const response = await fetch("/api/content");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load content.");
        }

        displayContent(data.content);

    } catch (error) {
        contentList.innerHTML = `
            <p class="empty-message">
                ${error.message}
            </p>
        `;
    }
}

// ==============================
// DISPLAY CONTENT
// ==============================

function displayContent(content) {

    if (content.length === 0) {
        contentList.innerHTML = `
            <p class="empty-message">
                No content items found.
            </p>
        `;
        return;
    }

    contentList.innerHTML = content.map(item => `
        <article class="content-item">

            <div class="content-item-header">
                <div>
                    <h3>${escapeHTML(item.title)}</h3>

                    <span class="content-category">
                        ${escapeHTML(item.category)}
                    </span>
                </div>
            </div>

            <p>
                ${escapeHTML(item.description)}
            </p>

            <div class="content-actions">

                <button
                    class="edit-btn"
                    onclick="editContent(
                        ${item.id},
                        '${escapeJS(item.title)}',
                        '${escapeJS(item.description)}',
                        '${escapeJS(item.category)}'
                    )"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteContent(${item.id})"
                >
                    Delete
                </button>

            </div>

        </article>
    `).join("");
}

// ==============================
// ADD / UPDATE — POST / PUT
// ==============================

contentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const category =
        document.getElementById("category").value.trim();

    if (!title || !description || !category) {

        showMessage(
            "Please complete all fields.",
            true
        );

        return;
    }

    const contentData = {
        title,
        description,
        category
    };

    try {

        let response;

        if (editingId === null) {

            // ADD
            response = await fetch("/api/content", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-admin-token":
                        sessionStorage.getItem("adminToken")
                },

                body: JSON.stringify(contentData)

            });

        } else {

            // EDIT
            response = await fetch(
                `/api/content/${editingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-token":
                            sessionStorage.getItem("adminToken")
                    },

                    body: JSON.stringify(contentData)
                }
            );
        }

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Something went wrong."
            );
        }

        showMessage(data.message, false);

        resetForm();

        await loadContent();

    } catch (error) {

        showMessage(
            error.message ||
            "Unable to save content.",
            true
        );
    }
});

// ==============================
// EDIT CONTENT
// ==============================

function editContent(
    id,
    title,
    description,
    category
) {

    editingId = id;

    document.getElementById("title").value = title;

    document.getElementById("description").value =
        description;

    document.getElementById("category").value =
        category;

    formTitle.textContent = "Edit Content";

    saveBtn.textContent = "Update Content";

    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==============================
// DELETE CONTENT — DELETE
// ==============================

async function deleteContent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/content/${id}`,
            {
                method: "DELETE",

                headers: {
                    "x-admin-token":
                        sessionStorage.getItem("adminToken")
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete content."
            );
        }

        showMessage(data.message, false);

        await loadContent();

    } catch (error) {

        showMessage(
            error.message ||
            "Unable to delete content.",
            true
        );
    }
}

// ==============================
// CANCEL EDIT
// ==============================

cancelBtn.addEventListener("click", () => {
    resetForm();
});

function resetForm() {

    editingId = null;

    contentForm.reset();

    formTitle.textContent = "Add New Content";

    saveBtn.textContent = "Add Content";

    cancelBtn.hidden = true;
}

// ==============================
// FORM MESSAGE
// ==============================

function showMessage(message, isError) {

    formMessage.textContent = message;

    formMessage.style.color =
        isError ? "#d64545" : "#2d8a55";
}

// ==============================
// LOGOUT
// ==============================

logoutBtn.addEventListener("click", () => {

    sessionStorage.removeItem("adminAuthenticated");

    sessionStorage.removeItem("adminToken");

    window.location.href = "/admin-login.html";
});

// ==============================
// BASIC HTML SAFETY
// ==============================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJS(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, "\\n");
}

// ==============================
// INITIAL LOAD
// ==============================

loadContent();