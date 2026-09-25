/* =========================================
   TRUST — INTERACTIVE CHECKER
========================================= */

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

const heroCheckButton =
    document.getElementById("heroCheckButton");

const ctaButton =
    document.getElementById("ctaButton");

const checkerTabs =
    document.querySelectorAll(".checker-tab");

const checkInput =
    document.getElementById("checkInput");

const inputLabel =
    document.getElementById("inputLabel");

const charCount =
    document.getElementById("charCount");

const clearButton =
    document.getElementById("clearButton");

const analyzeButton =
    document.getElementById("analyzeButton");

const analysisResult =
    document.getElementById("analysisResult");

const resetButton =
    document.getElementById("resetButton");

const checkRows =
    document.querySelectorAll(".check-row");


/* =========================================
   MOBILE MENU
========================================= */

if (menuButton && navLinks) {

    menuButton.addEventListener(
        "click",
        () => {
            navLinks.classList.toggle("open");
        }
    );

}


document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (navLinks) {
                    navLinks.classList.remove("open");
                }

            }
        );

    });


/* =========================================
   SCROLL TO CHECKER
========================================= */

function scrollToChecker() {

    const checker =
        document.getElementById("checker");

    if (checker) {

        checker.scrollIntoView({
            behavior: "smooth"
        });

    }

}


if (heroCheckButton) {

    heroCheckButton.addEventListener(
        "click",
        () => {
            scrollToChecker();
        }
    );

}


if (ctaButton) {

    ctaButton.addEventListener(
        "click",
        () => {
            scrollToChecker();
        }
    );

}


/* =========================================
   CHECKER TYPES
========================================= */

let currentType = "message";


const examples = {

    message:
        "Paste a message you're unsure about...",

    link:
        "Paste a link you're unsure about...",

    offer:
        "Paste an online offer you're unsure about..."

};


checkerTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            checkerTabs.forEach(item => {

                item.classList.remove("active");

            });


            tab.classList.add("active");


            currentType =
                tab.dataset.type;


            if (inputLabel) {

                if (currentType === "message") {

                    inputLabel.textContent =
                        "Paste a message";

                }

                if (currentType === "link") {

                    inputLabel.textContent =
                        "Paste a link";

                }

                if (currentType === "offer") {

                    inputLabel.textContent =
                        "Paste an offer";

                }

            }


            if (checkInput) {

                checkInput.innerHTML = "";

                checkInput.dataset.placeholder =
                    examples[currentType];

            }


            updateCharacterCount();

            hideResult();

        }
    );

});


/* =========================================
   CHARACTER COUNT
========================================= */

function updateCharacterCount() {

    if (!checkInput || !charCount) {
        return;
    }


    const text =
        checkInput.innerText.trim();


    charCount.textContent =
        `${text.length} character${text.length === 1 ? "" : "s"}`;

}


if (checkInput) {

    checkInput.addEventListener(
        "input",
        updateCharacterCount
    );

}


/* =========================================
   CLEAR
========================================= */

if (clearButton) {

    clearButton.addEventListener(
        "click",
        () => {

            if (!checkInput) {
                return;
            }


            checkInput.innerHTML = "";

            updateCharacterCount();

            hideResult();

            checkInput.focus();

        }
    );

}


/* =========================================
   ANALYZE
========================================= */

if (analyzeButton && checkInput) {

    analyzeButton.addEventListener(
        "click",
        () => {

            const text =
                checkInput.innerText.trim();


            if (!text) {

                checkInput.classList.add(
                    "input-error"
                );


                setTimeout(
                    () => {

                        checkInput.classList.remove(
                            "input-error"
                        );

                    },
                    500
                );


                checkInput.focus();

                return;

            }


            analyzeButton.classList.add(
                "loading"
            );


            analyzeButton.disabled = true;

            hideResult();


            setTimeout(
                () => {

                    analyzeText(text);

                    analyzeButton.classList.remove(
                        "loading"
                    );

                    analyzeButton.disabled = false;

                    showResult();

                },
                1000
            );

        }
    );

}


/* =========================================
   REAL FRONTEND ANALYSIS
========================================= */

function analyzeText(text) {

    const lowerText =
        text.toLowerCase();


    let riskScore = 0;

    let findings = [];


    /* -------------------------------------
       URGENCY
    ------------------------------------- */

    const urgencyWords = [

        "urgent",
        "immediately",
        "right now",
        "within 24 hours",
        "act now",
        "last chance",
        "expires today",
        "as soon as possible",
        "verify now",
        "limited time"

    ];


    const hasUrgency =
        urgencyWords.some(
            word =>
                lowerText.includes(word)
        );


    if (hasUrgency) {

        riskScore += 20;


        findings.push({

            title: "Urgency",

            text:
                "The message pressures you to act quickly."

        });

    }


    /* -------------------------------------
       PASSWORD / PERSONAL INFORMATION
    ------------------------------------- */

    const sensitiveWords = [

        "password",
        "credit card",
        "card number",
        "bank account",
        "social security",
        "verification code",
        "otp",
        "pin",
        "login",
        "personal information"

    ];


    const asksForSensitiveInfo =
        sensitiveWords.some(
            word =>
                lowerText.includes(word)
        );


    if (asksForSensitiveInfo) {

        riskScore += 30;


        findings.push({

            title:
                "Sensitive information",

            text:
                "The content appears to request sensitive information."

        });

    }


    /* -------------------------------------
       SUSPICIOUS LINK
    ------------------------------------- */

    const hasLink =
        /https?:\/\/|www\.|\.com\/|\.net\/|\.org\//i.test(
            text
        );


    const suspiciousDomains = [

        "verify-account",
        "account-verification",
        "secure-login",
        "login-confirm",
        "verify-now",
        "claim-prize",
        "free-gift",
        "payment-confirm"

    ];


    const suspiciousLink =
        suspiciousDomains.some(
            domain =>
                lowerText.includes(domain)
        );


    if (suspiciousLink) {

        riskScore += 30;


        findings.push({

            title:
                "Suspicious link",

            text:
                "The link contains patterns commonly associated with misleading pages."

        });

    }

    else if (hasLink) {

        riskScore += 8;


        findings.push({

            title:
                "External link",

            text:
                "The content contains an external link. Verify the destination before opening it."

        });

    }


    /* -------------------------------------
       MONEY / PAYMENT
    ------------------------------------- */

    const paymentWords = [

        "send money",
        "pay now",
        "payment",
        "wire transfer",
        "crypto",
        "bitcoin",
        "gift card",
        "transfer money",
        "deposit",
        "pay"

    ];


    const paymentRequest =
        paymentWords.some(
            word =>
                lowerText.includes(word)
        );


    if (paymentRequest) {

        riskScore += 25;


        findings.push({

            title:
                "Payment request",

            text:
                "The content appears to involve a payment or transfer request."

        });

    }


    /* -------------------------------------
       PRIZE / FREE MONEY
    ------------------------------------- */

    const prizeWords = [

        "you won",
        "winner",
        "congratulations",
        "free money",
        "free gift",
        "claim your prize",
        "lottery",
        "reward"

    ];


    const suspiciousPrize =
        prizeWords.some(
            word =>
                lowerText.includes(word)
        );


    if (suspiciousPrize) {

        riskScore += 20;


        findings.push({

            title:
                "Unusual reward",

            text:
                "The content makes an unexpected reward or prize claim."

        });

    }


    /* -------------------------------------
       IMPERSONATION
    ------------------------------------- */

    const impersonationWords = [

        "support team",
        "customer support",
        "security team",
        "bank security",
        "account team",
        "official support",
        "administrator"

    ];


    const possibleImpersonation =
        impersonationWords.some(
            word =>
                lowerText.includes(word)
        );


    if (possibleImpersonation) {

        riskScore += 15;


        findings.push({

            title:
                "Possible impersonation",

            text:
                "The sender may be presenting itself as an organization or support team."

        });

    }


    /* -------------------------------------
       THREAT
    ------------------------------------- */

    const threatWords = [

        "account will be closed",
        "account suspended",
        "legal action",
        "police",
        "penalty",
        "your account will be deleted",
        "suspended"

    ];


    const threat =
        threatWords.some(
            word =>
                lowerText.includes(word)
        );


    if (threat) {

        riskScore += 20;


        findings.push({

            title:
                "Threat or pressure",

            text:
                "The message uses consequences to pressure you into acting."

        });

    }


    /* -------------------------------------
       LINK + URGENCY COMBINATION
    ------------------------------------- */

    if (hasLink && hasUrgency) {

        riskScore += 15;

    }


    /* -------------------------------------
       LIMIT SCORE
    ------------------------------------- */

    riskScore =
        Math.min(
            riskScore,
            99
        );


    /* -------------------------------------
       DEFAULT FINDING
    ------------------------------------- */

    if (findings.length === 0) {

        findings.push({

            title:
                "No major warning signs",

            text:
                "TRUST did not detect strong risk indicators in this content."

        });

    }


    /* -------------------------------------
       RISK LEVEL
    ------------------------------------- */

    let riskLevel;


    if (riskScore >= 60) {

        riskLevel =
            "High risk";

    }

    else if (riskScore >= 30) {

        riskLevel =
            "Medium risk";

    }

    else {

        riskLevel =
            "Low risk";

    }


    /* -------------------------------------
       UPDATE RESULT
    ------------------------------------- */

    updateResult(
        riskScore,
        riskLevel,
        findings
    );

}


/* =========================================
   UPDATE RESULT UI
========================================= */

function updateResult(
    score,
    level,
    findings
) {

    if (!analysisResult) {
        return;
    }


    const resultTitle =
        analysisResult.querySelector(
            ".result-top h3"
        );


    const scoreNumber =
        analysisResult.querySelector(
            ".result-score strong"
        );


    const progress =
        document.getElementById(
            "progressFill"
        );


    const resultGrid =
        analysisResult.querySelector(
            ".result-grid"
        );


    if (
        !resultTitle ||
        !scoreNumber ||
        !progress ||
        !resultGrid
    ) {

        return;

    }


    resultTitle.textContent =
        level;


    scoreNumber.textContent =
        score;


    progress.style.width =
        `${score}%`;


    /* -------------------------------------
       RESULT COLOR
    ------------------------------------- */

    if (score >= 60) {

        resultTitle.style.color =
            "#e38d43";

        scoreNumber.style.color =
            "#e38d43";

    }

    else if (score >= 30) {

        resultTitle.style.color =
            "#e6b45d";

        scoreNumber.style.color =
            "#e6b45d";

    }

    else {

        resultTitle.style.color =
            "#65bf99";

        scoreNumber.style.color =
            "#65bf99";

    }


    /* -------------------------------------
       FINDINGS
    ------------------------------------- */

    resultGrid.innerHTML = "";


    findings
        .slice(0, 3)
        .forEach(
            finding => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "finding";


                div.innerHTML = `

                    <span class="finding-icon">
                        !
                    </span>

                    <div>

                        <strong>
                            ${finding.title}
                        </strong>

                        <p>
                            ${finding.text}
                        </p>

                    </div>

                `;


                resultGrid.appendChild(div);

            }
        );


    /* -------------------------------------
       RECOMMENDATION
    ------------------------------------- */

    const recommendation =
        analysisResult.querySelector(
            ".recommendation strong"
        );


    if (!recommendation) {
        return;
    }


    if (score >= 60) {

        recommendation.textContent =
            "Don't click or pay. Verify through the organization's official website or app.";

    }

    else if (score >= 30) {

        recommendation.textContent =
            "Pause before acting. Verify the sender, link, and request through another channel.";

    }

    else {

        recommendation.textContent =
            "No major warning signs were detected, but always verify important requests independently.";

    }

}


/* =========================================
   SHOW RESULT
========================================= */

function showResult() {

    if (analysisResult) {

        analysisResult.classList.add(
            "show"
        );

    }

}


/* =========================================
   HIDE RESULT
========================================= */

function hideResult() {

    if (analysisResult) {

        analysisResult.classList.remove(
            "show"
        );

    }

}


/* =========================================
   RESET
========================================= */

if (resetButton) {

    resetButton.addEventListener(
        "click",
        () => {

            if (checkInput) {

                checkInput.innerHTML = "";

                checkInput.focus();

            }


            updateCharacterCount();

            hideResult();

        }
    );

}


/* =========================================
   CHECK ROWS
========================================= */

checkRows.forEach(row => {

    row.addEventListener(
        "click",
        () => {

            const selectedType =
                row.dataset.demo;


            let tabType =
                selectedType;


            if (
                selectedType !== "message" &&
                selectedType !== "link" &&
                selectedType !== "offer"
            ) {

                tabType =
                    "message";

            }


            checkerTabs.forEach(tab => {

                tab.classList.remove(
                    "active"
                );


                if (
                    tab.dataset.type ===
                    tabType
                ) {

                    tab.classList.add(
                        "active"
                    );

                }

            });


            currentType =
                tabType;


            if (inputLabel) {

                if (tabType === "message") {

                    inputLabel.textContent =
                        "Paste a message";

                }

                if (tabType === "link") {

                    inputLabel.textContent =
                        "Paste a link";

                }

                if (tabType === "offer") {

                    inputLabel.textContent =
                        "Paste an offer";

                }

            }


            if (checkInput) {

                checkInput.innerHTML = "";

                checkInput.dataset.placeholder =
                    examples[tabType];

            }


            updateCharacterCount();

            hideResult();


            const checker =
                document.getElementById(
                    "checker"
                );


            if (checker) {

                checker.scrollIntoView({
                    behavior: "smooth"
                });

            }


            setTimeout(
                () => {

                    if (checkInput) {
                        checkInput.focus();
                    }

                },
                600
            );

        }
    );

});


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );


                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach(
    element => {

        revealObserver.observe(
            element
        );

    }
);


/* =========================================
   HERO CARD MOVEMENT
========================================= */

const heroVisual =
    document.querySelector(
        ".hero-visual"
    );


const messageCard =
    document.querySelector(
        ".message-card"
    );


const riskCard =
    document.querySelector(
        ".risk-card"
    );


if (
    window.innerWidth > 760 &&
    heroVisual &&
    messageCard &&
    riskCard
) {

    heroVisual.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroVisual.getBoundingClientRect();


            const x =
                (event.clientX - rect.left)
                / rect.width
                - 0.5;


            const y =
                (event.clientY - rect.top)
                / rect.height
                - 0.5;


            messageCard.style.transform =
                `rotate(-3deg)
                 translate(${x * 12}px, ${y * 12}px)`;


            riskCard.style.transform =
                `rotate(3deg)
                 translate(${x * -15}px, ${y * -15}px)`;

        }
    );


    heroVisual.addEventListener(
        "mouseleave",
        () => {

            messageCard.style.transform =
                "rotate(-3deg)";


            riskCard.style.transform =
                "rotate(3deg)";

        }
    );

}


/* =========================================
   TASK 6 - PUBLIC SERVICES
========================================= */

async function loadPublicServices() {

    const servicesContainer =
        document.getElementById(
            "publicServices"
        );


    if (!servicesContainer) {

        console.error(
            "publicServices element was not found."
        );

        return;
    }


    try {

        console.log(
            "Loading services from backend..."
        );


        const response =
            await fetch(
                "/api/services"
            );


        console.log(
            "Services API response:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Services data:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load services."
            );

        }


        if (
            !data.services ||
            data.services.length === 0
        ) {

            servicesContainer.innerHTML = `

                <div class="services-empty">

                    <h3>
                        No services available
                    </h3>

                    <p>
                        Our services will be available soon.
                    </p>

                </div>

            `;

            return;
        }


        servicesContainer.innerHTML =
            data.services
                .map(
                    service => `

                    <article
                        class="public-service-card"
                    >

                        <div
                            class="public-service-number"
                        >
                            ${String(service.id).padStart(2, "0")}
                        </div>


                        <span
                            class="public-service-category"
                        >

                            ${escapePublicHtml(
                                service.category
                            )}

                        </span>


                        <h3>

                            ${escapePublicHtml(
                                service.name
                            )}

                        </h3>


                        <p>

                            ${escapePublicHtml(
                                service.description
                            )}

                        </p>

                    </article>

                `
                )
                .join("");

    }


    catch (error) {

        console.error(
            "Services loading error:",
            error
        );


        servicesContainer.innerHTML = `

            <div class="services-error">

                <p>
                    Unable to load services.
                </p>

            </div>

        `;

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapePublicHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   TASK 7 - CUSTOMER REQUEST
========================================= */

async function loadRequestServices() {

    const serviceSelect =
        document.getElementById(
            "requestService"
        );


    if (!serviceSelect) {

        console.error(
            "requestService element was not found."
        );

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


        serviceSelect.innerHTML = `

            <option value="">
                Select a service
            </option>

        `;


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


                serviceSelect.appendChild(
                    option
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Request services loading error:",
            error
        );


        serviceSelect.innerHTML = `

            <option value="">
                Unable to load services
            </option>

        `;

    }

}


/* =========================================
   SUBMIT CUSTOMER REQUEST
========================================= */

const requestForm =
    document.getElementById(
        "requestForm"
    );


if (requestForm) {

    requestForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "requestName"
                    )
                    ?.value
                    .trim() || "";


            const email =
                document
                    .getElementById(
                        "requestEmail"
                    )
                    ?.value
                    .trim() || "";


            const service =
                document
                    .getElementById(
                        "requestService"
                    )
                    ?.value
                    .trim() || "";


            const message =
                document
                    .getElementById(
                        "requestMessage"
                    )
                    ?.value
                    .trim() || "";


            const statusMessage =
                document.getElementById(
                    "requestMessageStatus"
                );


            if (
                !name ||
                !email ||
                !service ||
                !message
            ) {

                if (statusMessage) {

                    statusMessage.textContent =
                        "Please fill in all fields.";

                    statusMessage.style.color =
                        "#d9534f";

                }

                return;
            }


            try {

                if (statusMessage) {

                    statusMessage.textContent =
                        "Submitting your request...";

                    statusMessage.style.color =
                        "#555";

                }


                const response =
                    await fetch(
                        "/api/requests",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    service:
                                        service,

                                    message:
                                        message

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
                        "Unable to submit request."
                    );

                }


                if (statusMessage) {

                    statusMessage.textContent =
                        "Your request has been submitted successfully.";

                    statusMessage.style.color =
                        "#2f8f5b";

                }


                requestForm.reset();

            }


            catch (error) {

                console.error(
                    "Request submission error:",
                    error
                );


                if (statusMessage) {

                    statusMessage.textContent =
                        error.message ||
                        "Unable to submit request.";

                    statusMessage.style.color =
                        "#d9534f";

                }

            }

        }
    );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPublicServices();

        loadRequestServices();

        updateCharacterCount();

    }
);