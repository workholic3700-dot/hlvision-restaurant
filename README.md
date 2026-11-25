HLVision Restaurant Website

A full-stack restaurant website developed to provide customers with a convenient way to explore meals, place orders, make reservations, and share their dining experiences.
The platform also includes an administrative dashboard for managing restaurant operations and website content.

Project Overview
HLVision Restaurant is a restaurant management and customer engagement platform built with a modern web technology stack.
The project combines a responsive customer-facing website with a backend API and an administration dashboard.

Features
Customer Website
Responsive restaurant website.
Restaurant introduction and information.
Dynamic food menu with pricing.
Special discount offers.
Food gallery with image viewing.
Online ordering and checkout.
Table reservation functionality.
Customer reviews and testimonials.
Contact information and location section.
Admin Dashboard
Administrative login.
Dashboard overview.
Order management.
Reservation management.
Menu management.
Discount offer management.
Gallery management.
Website image management.
Customer management.
Customer review moderation.
Reports and settings.
Technologies Used
Frontend
React
TypeScript
Vite
CSS
Backend
Node.js
Express.js
REST API
Database
PostgreSQL
Development Tools
Visual Studio Code
Git
GitHub

Project Structure
hlvision-restaurant/
│
├── public/
├── src/
│   ├── admin/
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── style.css
│
├── server/
│   ├── routes/
│   ├── db.js
│   └── server.js
│
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Installation and Setup

1. Clone the repository
git clone https://github.com/workholic3700-dot/hlvision-restaurant.git

2. Open the project
cd hlvision-restaurant

3. Install frontend dependencies
npm install

4. Install backend dependencies
cd server
npm install

5. Configure environment variables
Create a .env file inside the server directory.
Configure your PostgreSQL database credentials and session secret using the variable names expected by the backend:
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
SESSION_SECRET=your_secure_session_secret
Never commit your real .env file or credentials to GitHub.

7. Start the backend
From the server directory:
node server.js

7. Start the frontend
Open another terminal in the project root:
npm run dev
Open the local development URL displayed by Vite in your browser.
Note: PostgreSQL must be installed and running, and the database must be configured before using database-dependent features.

Security
Environment files containing credentials are excluded from version control.
Dependencies and private uploaded files are excluded from the public repository.
Configure secure credentials before deploying the application.

Developer
George Mahinyila
GitHub: @workholic3700-dot
Project Repository: HLVision Restaurant
Developed as a full-stack web development project and part of my software development portfolio.
