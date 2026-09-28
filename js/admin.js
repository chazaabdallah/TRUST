/* =========================================
   ADMIN AUTHENTICATION
========================================= */

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


/* =========================================
   ADMIN TOKEN
========================================= */

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
                "x-admin-token":
                    sessionStorage.getItem("adminToken")
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
                document
                    .getElementById("title")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value
                    .trim();


            if (
                !title ||
                !description ||
                !category
            ) {

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
   TASK 7 + TASK 8
   CUSTOMER REQUEST MANAGEMENT
========================================= */

const requestsList =
    document.getElementById("requestsList");


/* =========================================
   TASK 8
   SEARCH & FILTER ELEMENTS
========================================= */

const requestSearch =
    document.getElementById(
        "requestSearch"
    );


const requestServiceFilter =
    document.getElementById(
        "requestServiceFilter"
    );


const requestStatusFilter =
    document.getElementById(
        "requestStatusFilter"
    );


const clearRequestFilters =
    document.getElementById(
        "clearRequestFilters"
    );


const requestFilterMessage =
    document.getElementById(
        "requestFilterMessage"
    );


/* =========================================
   TASK 8
   LOAD CUSTOMER REQUESTS
   SEARCH + FILTER
========================================= */

async function loadRequests() {

    if (!requestsList) {

        console.error(
            "requestsList element was not found."
        );

        return;
    }


    try {

        /*
         * Get the current filter values.
         */

        const search =
            requestSearch
                ? requestSearch.value.trim()
                : "";


        const service =
            requestServiceFilter
                ? requestServiceFilter.value
                : "";


        const status =
            requestStatusFilter
                ? requestStatusFilter.value
                : "";


        /*
         * Build the query string.
         */

        const params =
            new URLSearchParams();


        if (search) {

            params.append(
                "search",
                search
            );

        }


        if (service) {

            params.append(
                "service",
                service
            );

        }


        if (status) {

            params.append(
                "status",
                status
            );

        }


        const queryString =
            params.toString();


        /*
         * If there are filters:
         *
         * /api/requests?search=...
         *
         * Otherwise:
         *
         * /api/requests
         */

        const url =
            queryString
                ? `/api/requests?${queryString}`
                : "/api/requests";


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "x-admin-token":
                            adminToken
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load customer requests."
            );

        }


        displayRequests(
            data.requests
        );


        updateRequestFilterMessage(
            data.requests.length
        );

    }

    catch (error) {

        console.error(
            "Request loading error:",
            error
        );


        requestsList.innerHTML = `
            <div class="empty-state">

                Unable to load customer requests.

                <br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>
        `;


        if (requestFilterMessage) {

            requestFilterMessage.textContent =
                "Unable to load requests.";

        }

    }

}


/* =========================================
   TASK 8
   LOAD SERVICE FILTER OPTIONS
========================================= */

async function loadRequestServiceFilter() {

    if (!requestServiceFilter) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/services"
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load services."
            );

        }


        /*
         * Start with "All services".
         */

        requestServiceFilter.innerHTML = `
            <option value="">
                All services
            </option>
        `;


        /*
         * Add every service from database.
         */

        data.services.forEach(
            service => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    service.name;


                option.textContent =
                    service.name;


                requestServiceFilter
                    .appendChild(
                        option
                    );

            }
        );

    }

    catch (error) {

        console.error(
            "Filter services loading error:",
            error
        );

    }

}


/* =========================================
   TASK 8
   FILTER RESULT COUNT
========================================= */

function updateRequestFilterMessage(
    count
) {

    if (!requestFilterMessage) {
        return;
    }


    if (count === 0) {

        requestFilterMessage.textContent =
            "No requests match your search and filters.";

        return;
    }


    requestFilterMessage.textContent =
        `${count} request${count === 1 ? "" : "s"} found.`;

}


/* =========================================
   DISPLAY CUSTOMER REQUESTS
========================================= */

function displayRequests(requests) {

    if (!requestsList) {
        return;
    }


    if (
        !requests ||
        requests.length === 0
    ) {

        requestsList.innerHTML = `
            <div class="empty-state">
                No customer requests yet.
            </div>
        `;

        return;
    }


    requestsList.innerHTML =
        requests.map(request => `

            <article class="request-card">

                <div class="request-card-header">

                    <div>

                        <span class="request-id">
                            Request #${request.id}
                        </span>


                        <h3>
                            ${escapeHTML(request.name)}
                        </h3>

                    </div>


                    <span class="request-status">
                        ${escapeHTML(request.status)}
                    </span>

                </div>


                <div class="request-details">

                    <p>
                        <strong>Email:</strong>
                        ${escapeHTML(request.email)}
                    </p>


                    <p>
                        <strong>Service:</strong>
                        ${escapeHTML(request.service)}
                    </p>


                    <p>
                        <strong>Message:</strong>
                        ${escapeHTML(request.message)}
                    </p>


                    <p>
                        <strong>Date:</strong>
                        ${escapeHTML(request.created_at)}
                    </p>

                </div>


                <div class="request-actions">

                    <label
                        for="request-status-${request.id}"
                    >
                        Update Status
                    </label>


                    <select
                        id="request-status-${request.id}"
                        onchange="updateRequestStatus(
                            ${request.id},
                            this.value
                        )"
                    >

                        <option
                            value="Pending"
                            ${request.status === "Pending"
                                ? "selected"
                                : ""}
                        >
                            Pending
                        </option>


                        <option
                            value="In Progress"
                            ${request.status === "In Progress"
                                ? "selected"
                                : ""}
                        >
                            In Progress
                        </option>


                        <option
                            value="Completed"
                            ${request.status === "Completed"
                                ? "selected"
                                : ""}
                        >
                            Completed
                        </option>


                        <option
                            value="Rejected"
                            ${request.status === "Rejected"
                                ? "selected"
                                : ""}
                        >
                            Rejected
                        </option>

                    </select>

                </div>

            </article>

        `).join("");

}


/* =========================================
   TASK 8
   SEARCH EVENT
========================================= */

if (requestSearch) {

    let searchTimeout;


    requestSearch.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimeout
            );


            /*
             * Wait 300ms after the user
             * stops typing before calling
             * the backend.
             */

            searchTimeout =
                setTimeout(
                    () => {

                        loadRequests();

                    },
                    300
                );

        }
    );

}


/* =========================================
   TASK 8
   SERVICE FILTER EVENT
========================================= */

if (requestServiceFilter) {

    requestServiceFilter.addEventListener(
        "change",
        () => {

            loadRequests();

        }
    );

}


/* =========================================
   TASK 8
   STATUS FILTER EVENT
========================================= */

if (requestStatusFilter) {

    requestStatusFilter.addEventListener(
        "change",
        () => {

            loadRequests();

        }
    );

}


/* =========================================
   TASK 8
   CLEAR FILTERS
========================================= */

if (clearRequestFilters) {

    clearRequestFilters.addEventListener(
        "click",
        () => {

            if (requestSearch) {

                requestSearch.value = "";

            }


            if (requestServiceFilter) {

                requestServiceFilter.value = "";

            }


            if (requestStatusFilter) {

                requestStatusFilter.value = "";

            }


            loadRequests();

        }
    );

}


/* =========================================
   TASK 7
   UPDATE REQUEST STATUS
========================================= */

async function updateRequestStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(
                `/api/requests/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-admin-token":
                            adminToken
                    },

                    body:
                        JSON.stringify({
                            status: status
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update request status."
            );

        }


        /*
         * Reload requests after
         * changing the status.
         *
         * If filters are active,
         * the same filters stay active.
         */

        await loadRequests();

    }

    catch (error) {

        console.error(
            "Request status update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update request status."
        );

    }

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

        /*
         * Task 8:
         * Load service names into
         * the service filter.
         */

        await loadRequestServiceFilter();

        /*
         * Task 7 + Task 8:
         * Load customer requests.
         */

        await loadRequests();

    }
);