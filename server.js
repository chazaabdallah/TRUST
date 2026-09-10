const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const dbFolder = path.join(__dirname, "database");

if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
}

const db = require("./database/database");

const app = express();
const PORT = process.env.PORT || 3001;


/* Middleware */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


/* Serve frontend */

app.use(express.static(__dirname));


/* =========================================
   POST /api/contact
========================================= */

app.post("/api/contact", (req, res) => {

    const {
        name,
        email,
        subject,
        message
    } = req.body;


    /* Required fields */

    if (
        !name ||
        !email ||
        !subject ||
        !message
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }


    /* Remove unnecessary spaces */

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();


    /* Check empty after trimming */

    if (
        cleanName === "" ||
        cleanEmail === "" ||
        cleanSubject === "" ||
        cleanMessage === ""
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }


    /* Email validation */

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(cleanEmail)) {

        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });

    }


    /* Store in database */

    const sql = `
        INSERT INTO inquiries
        (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;


    db.run(
        sql,
        [
            cleanName,
            cleanEmail,
            cleanSubject,
            cleanMessage
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to save your inquiry."
                });

            }


            return res.status(201).json({

                success: true,

                message:
                    "Your inquiry has been submitted successfully.",

                inquiryId: this.lastID

            });

        }
    );

});


/* =========================================
   START SERVER
========================================= */
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `TRUST server running at http://localhost:${PORT}`
    );
});
