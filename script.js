/* =========================================
   TRUST — INTERACTIVE CHECKER
========================================= */

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

const heroCheckButton = document.getElementById("heroCheckButton");
const ctaButton = document.getElementById("ctaButton");

const checkerTabs = document.querySelectorAll(".checker-tab");

const checkInput = document.getElementById("checkInput");
const inputLabel = document.getElementById("inputLabel");
const charCount = document.getElementById("charCount");

const clearButton = document.getElementById("clearButton");
const analyzeButton = document.getElementById("analyzeButton");

const analysisResult = document.getElementById("analysisResult");
const resetButton = document.getElementById("resetButton");

const checkRows = document.querySelectorAll(".check-row");


/* =========================================
   MOBILE MENU
========================================= */

menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
});


document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
    });

});


/* =========================================
   SCROLL TO CHECKER
========================================= */

function scrollToChecker() {

    document.getElementById("checker").scrollIntoView({
        behavior: "smooth"
    });

}


heroCheckButton.addEventListener("click", () => {
    scrollToChecker();
});


ctaButton.addEventListener("click", () => {
    scrollToChecker();
});


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

    tab.addEventListener("click", () => {

        checkerTabs.forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        currentType = tab.dataset.type;

        if (currentType === "message") {
            inputLabel.textContent = "Paste a message";
        }

        if (currentType === "link") {
            inputLabel.textContent = "Paste a link";
        }

        if (currentType === "offer") {
            inputLabel.textContent = "Paste an offer";
        }

        checkInput.innerHTML = "";

        checkInput.dataset.placeholder =
            examples[currentType];

        updateCharacterCount();

        hideResult();

    });

});


/* =========================================
   CHARACTER COUNT
========================================= */

function updateCharacterCount() {

    const text = checkInput.innerText.trim();

    charCount.textContent =
        `${text.length} character${text.length === 1 ? "" : "s"}`;

}


checkInput.addEventListener(
    "input",
    updateCharacterCount
);


/* =========================================
   CLEAR
========================================= */

clearButton.addEventListener("click", () => {

    checkInput.innerHTML = "";

    updateCharacterCount();

    hideResult();

    checkInput.focus();

});


/* =========================================
   ANALYZE
========================================= */

analyzeButton.addEventListener("click", () => {

    const text = checkInput.innerText.trim();


    if (!text) {

        checkInput.classList.add("input-error");

        setTimeout(() => {
            checkInput.classList.remove("input-error");
        }, 500);

        checkInput.focus();

        return;
    }


    analyzeButton.classList.add("loading");

    analyzeButton.disabled = true;

    hideResult();


    setTimeout(() => {

        analyzeText(text);

        analyzeButton.classList.remove("loading");

        analyzeButton.disabled = false;

        showResult();

    }, 1000);

});


/* =========================================
   REAL FRONTEND ANALYSIS
========================================= */

function analyzeText(text) {

    const lowerText = text.toLowerCase();

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
        urgencyWords.some(word =>
            lowerText.includes(word)
        );


    if (hasUrgency) {

        riskScore += 20;

        findings.push({
            title: "Urgency",
            text: "The message pressures you to act quickly."
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
        sensitiveWords.some(word =>
            lowerText.includes(word)
        );


    if (asksForSensitiveInfo) {

        riskScore += 30;

        findings.push({
            title: "Sensitive information",
            text: "The content appears to request sensitive information."
        });

    }


    /* -------------------------------------
       SUSPICIOUS LINK
    ------------------------------------- */

    const hasLink =
        /https?:\/\/|www\.|\.com\/|\.net\/|\.org\//i.test(text);


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
        suspiciousDomains.some(domain =>
            lowerText.includes(domain)
        );


    if (suspiciousLink) {

        riskScore += 30;

        findings.push({
            title: "Suspicious link",
            text: "The link contains patterns commonly associated with misleading pages."
        });

    }
    else if (hasLink) {

        riskScore += 8;

        findings.push({
            title: "External link",
            text: "The content contains an external link. Verify the destination before opening it."
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
        paymentWords.some(word =>
            lowerText.includes(word)
        );


    if (paymentRequest) {

        riskScore += 25;

        findings.push({
            title: "Payment request",
            text: "The content appears to involve a payment or transfer request."
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
        prizeWords.some(word =>
            lowerText.includes(word)
        );


    if (suspiciousPrize) {

        riskScore += 20;

        findings.push({
            title: "Unusual reward",
            text: "The content makes an unexpected reward or prize claim."
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
        impersonationWords.some(word =>
            lowerText.includes(word)
        );


    if (possibleImpersonation) {

        riskScore += 15;

        findings.push({
            title: "Possible impersonation",
            text: "The sender may be presenting itself as an organization or support team."
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
        threatWords.some(word =>
            lowerText.includes(word)
        );


    if (threat) {

        riskScore += 20;

        findings.push({
            title: "Threat or pressure",
            text: "The message uses consequences to pressure you into acting."
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

    riskScore = Math.min(riskScore, 99);


    /* -------------------------------------
       DEFAULT FINDING
    ------------------------------------- */

    if (findings.length === 0) {

        findings.push({
            title: "No major warning signs",
            text: "TRUST did not detect strong risk indicators in this content."
        });

    }


    /* -------------------------------------
       RISK LEVEL
    ------------------------------------- */

    let riskLevel;


    if (riskScore >= 60) {

        riskLevel = "High risk";

    }
    else if (riskScore >= 30) {

        riskLevel = "Medium risk";

    }
    else {

        riskLevel = "Low risk";

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

function updateResult(score, level, findings) {

    const resultTitle =
        analysisResult.querySelector(".result-top h3");

    const scoreNumber =
        analysisResult.querySelector(".result-score strong");

    const progress =
        document.getElementById("progressFill");

    const resultGrid =
        analysisResult.querySelector(".result-grid");


    resultTitle.textContent = level;

    scoreNumber.textContent = score;

    progress.style.width = `${score}%`;


    /* -------------------------------------
       RESULT COLOR
    ------------------------------------- */

    if (score >= 60) {

        resultTitle.style.color = "#e38d43";
        scoreNumber.style.color = "#e38d43";

    }
    else if (score >= 30) {

        resultTitle.style.color = "#e6b45d";
        scoreNumber.style.color = "#e6b45d";

    }
    else {

        resultTitle.style.color = "#65bf99";
        scoreNumber.style.color = "#65bf99";

    }


    /* -------------------------------------
       FINDINGS
    ------------------------------------- */

    resultGrid.innerHTML = "";


    findings.slice(0, 3).forEach(finding => {

        const div = document.createElement("div");

        div.className = "finding";

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

    });


    /* -------------------------------------
       RECOMMENDATION
    ------------------------------------- */

    const recommendation =
        analysisResult.querySelector(
            ".recommendation strong"
        );


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

    analysisResult.classList.add("show");

}


/* =========================================
   HIDE RESULT
========================================= */

function hideResult() {

    analysisResult.classList.remove("show");

}


/* =========================================
   RESET
========================================= */

resetButton.addEventListener("click", () => {

    checkInput.innerHTML = "";

    updateCharacterCount();

    hideResult();

    checkInput.focus();

});


/* =========================================
   CHECK ROWS
========================================= */

checkRows.forEach(row => {

    row.addEventListener("click", () => {

        const selectedType = row.dataset.demo;

        let tabType = selectedType;


        if (
            selectedType !== "message" &&
            selectedType !== "link" &&
            selectedType !== "offer"
        ) {

            tabType = "message";

        }


        checkerTabs.forEach(tab => {

            tab.classList.remove("active");

            if (tab.dataset.type === tabType) {

                tab.classList.add("active");

            }

        });


        currentType = tabType;


        if (tabType === "message") {
            inputLabel.textContent = "Paste a message";
        }

        if (tabType === "link") {
            inputLabel.textContent = "Paste a link";
        }

        if (tabType === "offer") {
            inputLabel.textContent = "Paste an offer";
        }


        checkInput.innerHTML = "";

        checkInput.dataset.placeholder =
            examples[tabType];

        updateCharacterCount();

        hideResult();


        document
            .getElementById("checker")
            .scrollIntoView({
                behavior: "smooth"
            });


        setTimeout(() => {
            checkInput.focus();
        }, 600);

    });

});


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(".reveal");


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================
   HERO CARD MOVEMENT
========================================= */

const heroVisual =
    document.querySelector(".hero-visual");

const messageCard =
    document.querySelector(".message-card");

const riskCard =
    document.querySelector(".risk-card");


if (window.innerWidth > 760) {

    heroVisual.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                (event.clientX - rect.left)
                / rect.width - 0.5;

            const y =
                (event.clientY - rect.top)
                / rect.height - 0.5;


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
   INITIALIZE
========================================= */

updateCharacterCount();