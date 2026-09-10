# TRUST

TRUST is a web-based platform designed to help users evaluate suspicious messages, links, and online offers before trusting them.

## Features

- Interactive trust and risk checker
- Risk score and risk level assessment
- Detection of suspicious signals
- Recommendations based on detected risks
- Contact and inquiry form
- Frontend and backend validation
- Inquiry storage in a SQLite database
- Responsive design for desktop and mobile

## Technologies

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- SQLite

## Contact & Inquiry System

The contact form allows users to submit:

- Name
- Email
- Subject
- Message

Submitted inquiries are sent to the backend through the `POST /api/contact` endpoint, validated, and stored in the SQLite database.

## Project Structure

```text
TRUST/
├── css/
│   └── style.css
├── database/
│   ├── database.js
│   └── trust.db
├── js/
│   └── script.js
├── index.html
├── server.js
├── package.json
├── package-lock.json
└── README.md
Installation

Install the required dependencies:

npm install
Run the Project

Start the server:

node server.js

Then open:

http://localhost:3001