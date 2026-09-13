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

const ADMIN_TOKEN = "trust-admin-token-2026";


// =========================================
// ADMIN AUTHENTICATION
// =========================================

function requireAdmin(req, res, next) {

    const token = req.headers["x-admin-token"];

    if (token !== ADMIN_TOKEN) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized. Admin login required."
        });
    }

    next();
}


// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// =========================================
// SERVE FRONTEND
// =========================================

app.use(express.static(__dirname));


// =========================================
// ADMIN LOGIN
// =========================================

app.post("/api/admin/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    if (
        username === "admin" &&
        password === "trustadmin"
    ) {

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token: ADMIN_TOKEN
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid username or password."
    });
});


// =========================================
// GET CONTENT
// =========================================

app.get("/api/content", requireAdmin, (req, res) => {

    const sql = `
        SELECT *
        FROM content
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve content."
            });
        }

        return res.status(200).json({
            success: true,
            content: rows
        });
    });
});


// =========================================
// ADD CONTENT
// =========================================

app.post("/api/content", requireAdmin, (req, res) => {

    const {
        title,
        description,
        category
    } = req.body;

    if (!title || !description || !category) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (
        cleanTitle === "" ||
        cleanDescription === "" ||
        cleanCategory === ""
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const sql = `
        INSERT INTO content
        (title, description, category)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [
            cleanTitle,
            cleanDescription,
            cleanCategory
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to add content."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Content added successfully.",
                contentId: this.lastID
            });
        }
    );
});


// =========================================
// EDIT CONTENT
// =========================================

app.put("/api/content/:id", requireAdmin, (req, res) => {

    const { id } = req.params;

    const {
        title,
        description,
        category
    } = req.body;

    if (!title || !description || !category) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (
        cleanTitle === "" ||
        cleanDescription === "" ||
        cleanCategory === ""
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const sql = `
        UPDATE content
        SET title = ?, description = ?, category = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            cleanTitle,
            cleanDescription,
            cleanCategory,
            id
        ],
        function (err) {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to update content."
                });
            }

            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Content item not found."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Content updated successfully."
            });
        }
    );
});


// =========================================
// DELETE CONTENT
// =========================================

app.delete("/api/content/:id", requireAdmin, (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM content
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete content."
            });
        }

        if (this.changes === 0) {

            return res.status(404).json({
                success: false,
                message: "Content item not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Content deleted successfully."
        });
    });
});


// =========================================
// CONTACT FORM — TASK 2
// =========================================

app.post("/api/contact", (req, res) => {

    const {
        name,
        email,
        subject,
        message
    } = req.body;


    // Required fields

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


    // Remove unnecessary spaces

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();


    // Check empty after trimming

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


    // Email validation

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {

        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }


    // Store in database

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


// =========================================
// START SERVER
// =========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `TRUST server running at http://localhost:${PORT}`
    );
});