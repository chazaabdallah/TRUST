
if (
    sessionStorage.getItem("adminAuthenticated") !== "true"
) {
    window.location.href = "/admin-login.html";
}


/* =========================================
   CONTENT ELEMENTS
========================================= */

const contentForm =
    document.getElementById("contentForm");

const contentList =
    document.getElementById("contentList");

const formTitle =
    document.getElementById("formTitle");

const saveBtn =
    document.getElementById("saveBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const formMessage =
    document.getElementById("formMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

let editingId = null;


/* =========================================
   SERVICE ELEMENTS
========================================= */

const serviceForm =
    document.getElementById("serviceForm");

const serviceId =
    document.getElementById("serviceId");

const serviceName =
    document.getElementById("serviceName");

const serviceDescription =
    document.getElementById("serviceDescription");

const serviceCategory =
    document.getElementById("serviceCategory");

const servicesList =
    document.getElementById("servicesList");

const serviceMessage =
    document.getElementById("serviceMessage");

const serviceSubmitBtn =
    document.getElementById("serviceSubmitBtn");

const cancelServiceEdit =
    document.getElementById("cancelServiceEdit");


const adminToken =
    sessionStorage.getItem("adminToken");


/* =========================================
   LOAD CONTENT
========================================= */

async function loadContent() {

    try {

        const response = await fetch("/api/content", {
    method: "GET",
    headers: {
        "x-admin-token": sessionStorage.getItem("adminToken")
    }
});

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load content."
            );

        }

        displayContent(data.content);

    }

    catch (error) {

        console.error(
            "Content loading error:",
            error
        );

        if (contentList) {

            contentList.innerHTML = `
                <p class="empty-message">
                    ${escapeHTML(error.message)}
                </p>
            `;

        }

    }

}


/* =========================================
   DISPLAY CONTENT
========================================= */

function displayContent(content) {

    if (!contentList) {
        return;
    }


    if (!content || content.length === 0) {

        contentList.innerHTML = `
            <p class="empty-message">
                No content items found.
            </p>
        `;

        return;
    }


    contentList.innerHTML =
        content.map(item => `

            <article class="content-item">

                <div class="content-item-header">

                    <div>

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

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


/* =========================================
   ADD / UPDATE CONTENT
========================================= */

if (contentForm) {

    contentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document.getElementById("title")
                    .value.trim();

            const description =
                document.getElementById("description")
                    .value.trim();

            const category =
                document.getElementById("category")
                    .value.trim();


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

                    response =
                        await fetch(
                            "/api/content",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "x-admin-token":
                                        adminToken
                                },

                                body:
                                    JSON.stringify(
                                        contentData
                                    )
                            }
                        );

                }

                else {

                    response =
                        await fetch(
                            `/api/content/${editingId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "x-admin-token":
                                        adminToken
                                },

                                body:
                                    JSON.stringify(
                                        contentData
                                    )
                            }
                        );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Something went wrong."
                    );

                }


                showMessage(
                    data.message,
                    false
                );


                resetForm();


                await loadContent();

            }

            catch (error) {

                showMessage(
                    error.message ||
                    "Unable to save content.",
                    true
                );

            }

        }
    );

}


/* =========================================
   EDIT CONTENT
========================================= */

function editContent(
    id,
    title,
    description,
    category
) {

    editingId = id;


    document.getElementById("title").value =
        title;

    document.getElementById("description").value =
        description;

    document.getElementById("category").value =
        category;


    formTitle.textContent =
        "Edit Content";

    saveBtn.textContent =
        "Update Content";

    cancelBtn.hidden =
        false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   DELETE CONTENT
========================================= */

async function deleteContent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this content?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/content/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete content."
            );

        }


        showMessage(
            data.message,
            false
        );


        await loadContent();

    }

    catch (error) {

        showMessage(
            error.message ||
            "Unable to delete content.",
            true
        );

    }

}


/* =========================================
   CANCEL CONTENT EDIT
========================================= */

if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        () => {
            resetForm();
        }
    );

}


function resetForm() {

    editingId = null;

    contentForm.reset();

    formTitle.textContent =
        "Add New Content";

    saveBtn.textContent =
        "Add Content";

    cancelBtn.hidden =
        true;

}


/* =========================================
   CONTENT MESSAGE
========================================= */

function showMessage(
    message,
    isError
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;

    formMessage.style.color =
        isError
            ? "#d64545"
            : "#2d8a55";

}


/* =========================================
   TASK 6
   LOAD SERVICES
========================================= */

async function loadServices() {

    if (!servicesList) {

        console.error(
            "servicesList element was not found."
        );

        return;
    }


    try {

        console.log(
            "Loading services..."
        );


        const response =
            await fetch("/api/services");


        console.log(
            "Services response:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Services:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load services."
            );

        }


        renderServices(
            data.services
        );

    }

    catch (error) {

        console.error(
            "Service loading error:",
            error
        );


        servicesList.innerHTML = `
            <div class="empty-state">

                Unable to load services.

                <br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>
        `;

    }

}


/* =========================================
   DISPLAY SERVICES
========================================= */

function renderServices(services) {

    if (!servicesList) {
        return;
    }


    if (
        !services ||
        services.length === 0
    ) {

        servicesList.innerHTML = `

            <div class="empty-state">

                No services have been added yet.

            </div>

        `;

        return;
    }


    servicesList.innerHTML =
        services.map(service => `

            <div class="service-management-card">

                <div class="service-card-content">

                    <span class="service-category">

                        ${escapeHTML(
                            service.category
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            service.name
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            service.description
                        )}

                    </p>

                </div>


                <div class="service-card-actions">

                    <button
                        type="button"
                        class="edit-service-btn"
                        onclick="editService(${service.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-service-btn"
                        onclick="deleteService(${service.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");

}


/* =========================================
   CREATE / UPDATE SERVICE
========================================= */

if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const id =
                serviceId.value;


            const serviceData = {

                name:
                    serviceName.value.trim(),

                description:
                    serviceDescription.value.trim(),

                category:
                    serviceCategory.value.trim()

            };


            if (
                !serviceData.name ||
                !serviceData.description ||
                !serviceData.category
            ) {

                showServiceMessage(
                    "Please complete all service fields.",
                    "error"
                );

                return;
            }


            const isEditing =
                id !== "";


            try {

                const response =
                    await fetch(
                        isEditing
                            ? `/api/services/${id}`
                            : "/api/services",
                        {

                            method:
                                isEditing
                                    ? "PUT"
                                    : "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "x-admin-token":
                                    adminToken

                            },

                            body:
                                JSON.stringify(
                                    serviceData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to save service."
                    );

                }


                showServiceMessage(
                    data.message,
                    "success"
                );


                resetServiceForm();


                await loadServices();

            }

            catch (error) {

                console.error(
                    "Service save error:",
                    error
                );


                showServiceMessage(
                    error.message ||
                    "Unable to save service.",
                    "error"
                );

            }

        }
    );

}


/* =========================================
   EDIT SERVICE
========================================= */

async function editService(id) {

    try {

        const response =
            await fetch(
                "/api/services"
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load service."
            );

        }


        const service =
            data.services.find(
                item =>
                    Number(item.id) === Number(id)
            );


        if (!service) {

            showServiceMessage(
                "Service not found.",
                "error"
            );

            return;
        }


        serviceId.value =
            service.id;

        serviceName.value =
            service.name;

        serviceDescription.value =
            service.description;

        serviceCategory.value =
            service.category;


        serviceSubmitBtn.textContent =
            "Update Service";


        cancelServiceEdit.style.display =
            "inline-flex";


        serviceForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

    catch (error) {

        console.error(
            "Edit service error:",
            error
        );

    }

}


/* =========================================
   DELETE SERVICE
========================================= */

async function deleteService(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this service?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/services/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete service."
            );

        }


        showServiceMessage(
            data.message,
            "success"
        );


        await loadServices();

    }

    catch (error) {

        console.error(
            "Delete service error:",
            error
        );


        showServiceMessage(
            error.message ||
            "Unable to delete service.",
            "error"
        );

    }

}


/* =========================================
   CANCEL SERVICE EDIT
========================================= */

if (cancelServiceEdit) {

    cancelServiceEdit.addEventListener(
        "click",
        () => {
            resetServiceForm();
        }
    );

}


function resetServiceForm() {

    if (!serviceForm) {
        return;
    }


    serviceForm.reset();


    serviceId.value =
        "";


    serviceSubmitBtn.textContent =
        "Add Service";


    cancelServiceEdit.style.display =
        "none";

}


/* =========================================
   SERVICE MESSAGE
========================================= */

function showServiceMessage(
    message,
    type
) {

    if (!serviceMessage) {
        return;
    }


    serviceMessage.textContent =
        message;


    serviceMessage.className =
        `form-message ${type}`;


    setTimeout(() => {

        serviceMessage.textContent =
            "";

        serviceMessage.className =
            "form-message";

    }, 4000);

}


/* =========================================
   LOGOUT
========================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "adminAuthenticated"
            );

            sessionStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "/admin-login.html";

        }
    );

}


/* =========================================
   HTML SAFETY
========================================= */

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


/* =========================================
   INITIAL LOAD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadContent();

        await loadServices();

    }
);