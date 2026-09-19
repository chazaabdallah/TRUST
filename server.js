const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const dbFolder = path.join(__dirname, "database");

if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
}

const db = require("./database/database");

const app = express();

const PORT = process.env.PORT || 3001;

const ADMIN_TOKEN = "trust-admin-token-2026";

const userTokens = new Map();


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
// USER AUTHENTICATION
// =========================================

function requireUser(req, res, next) {

    const token = req.headers["x-auth-token"];

    if (!token || !userTokens.has(token)) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please log in."
        });
    }

    req.userId = userTokens.get(token);

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
// ADMIN LOGIN — TASK 3
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
// USER REGISTRATION — TASK 4
// =========================================

app.post("/api/auth/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required."
        });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName === "" || cleanEmail === "") {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        });
    }

    try {

        db.get(
            `SELECT id FROM users WHERE email = ?`,
            [cleanEmail],
            async (err, user) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });
                }

                if (user) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "An account with this email already exists."
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(password, 12);

                db.run(
                    `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                    `,
                    [
                        cleanName,
                        cleanEmail,
                        hashedPassword
                    ],
                    function (err) {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                success: false,
                                message: "Unable to create account."
                            });
                        }

                        return res.status(201).json({
                            success: true,
                            message:
                                "Account created successfully.",
                            userId: this.lastID
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});


// =========================================
// USER LOGIN — TASK 4
// =========================================

app.post("/api/auth/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    db.get(
        `
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
        `,
        [cleanEmail],
        async (err, user) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            const token =
                crypto.randomBytes(32).toString("hex");

            userTokens.set(token, user.id);

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
    );
});


// =========================================
// PROTECTED USER PROFILE — TASK 4
// =========================================

app.get("/api/auth/me", requireUser, (req, res) => {

    db.get(
        `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
        `,
        [req.userId],
        (err, user) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            return res.status(200).json({
                success: true,
                user
            });
        }
    );
});
// =========================================
// UPDATE CUSTOMER ACCOUNT — TASK 5
// =========================================

app.put("/api/auth/me", requireUser, async (req, res) => {

    const {
        name,
        email,
        currentPassword,
        newPassword
    } = req.body;

    // ==============================
    // BASIC VALIDATION
    // ==============================

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required."
        });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName === "" || cleanEmail === "") {
        return res.status(400).json({
            success: false,
            message: "Name and email cannot be empty."
        });
    }

    // ==============================
    // EMAIL VALIDATION
    // ==============================

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    // ==============================
    // GET CURRENT USER
    // ==============================

    db.get(
        `
        SELECT id, name, email, password
        FROM users
        WHERE id = ?
        `,
        [req.userId],
        async (err, user) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            // ==============================
            // CHECK EMAIL AVAILABILITY
            // ==============================

            db.get(
                `
                SELECT id
                FROM users
                WHERE email = ?
                AND id != ?
                `,
                [cleanEmail, req.userId],
                async (emailErr, existingUser) => {

                    if (emailErr) {
                        console.error(emailErr);

                        return res.status(500).json({
                            success: false,
                            message: "Database error."
                        });
                    }

                    if (existingUser) {
                        return res.status(409).json({
                            success: false,
                            message:
                                "This email is already used by another account."
                        });
                    }

                    // ==============================
                    // PASSWORD UPDATE
                    // ==============================

                    let finalPassword = user.password;

                    if (newPassword) {

                        if (!currentPassword) {
                            return res.status(400).json({
                                success: false,
                                message:
                                    "Current password is required to change your password."
                            });
                        }

                        if (newPassword.length < 8) {
                            return res.status(400).json({
                                success: false,
                                message:
                                    "New password must be at least 8 characters."
                            });
                        }

                        const passwordMatch =
                            await bcrypt.compare(
                                currentPassword,
                                user.password
                            );

                        if (!passwordMatch) {
                            return res.status(401).json({
                                success: false,
                                message:
                                    "Current password is incorrect."
                            });
                        }

                        finalPassword =
                            await bcrypt.hash(
                                newPassword,
                                12
                            );
                    }

                    // ==============================
                    // UPDATE DATABASE
                    // ==============================

                    db.run(
                        `
                        UPDATE users
                        SET name = ?, email = ?, password = ?
                        WHERE id = ?
                        `,
                        [
                            cleanName,
                            cleanEmail,
                            finalPassword,
                            req.userId
                        ],
                        function (updateErr) {

                            if (updateErr) {
                                console.error(updateErr);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Unable to update account."
                                });
                            }

                            return res.status(200).json({
                                success: true,
                                message:
                                    "Account updated successfully.",
                                user: {
                                    id: user.id,
                                    name: cleanName,
                                    email: cleanEmail
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});


// =========================================
// USER LOGOUT — TASK 4
// =========================================

app.post("/api/auth/logout", requireUser, (req, res) => {

    const token = req.headers["x-auth-token"];

    userTokens.delete(token);

    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
});


// =========================================
// GET CONTENT — TASK 3
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
// ADD CONTENT — TASK 3
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
// EDIT CONTENT — TASK 3
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
// DELETE CONTENT — TASK 3
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

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

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

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {

        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

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