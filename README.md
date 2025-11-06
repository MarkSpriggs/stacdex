# 🧩 StacDex — Sports Card Inventory & Analytics App

**StacDex** is a full-stack web app built for collectors to **organize, analyze, and manage their trading cards** — including sports, Pokémon, and other collectible cards.  
It allows authenticated users to log in, upload cards (with image storage in AWS S3), track sales and listings, and view collection analytics.

---

## 🚀 Overview

### Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL
- Storage: AWS S3 Bucket
- Authentication: JWT (JSON Web Token)
- ORM/Queries: Raw SQL using the `pg` client

The backend handles authentication, CRUD operations for users and items, and integrates directly with AWS S3 for image upload and deletion.

---

## ⚙️ Installation & Setup

### 1. Clone the repo

```bash
git clone git@github.com:MarkSpriggs/stacdex.git
cd stacdex/backend
2. Install dependencies
bash
Copy code
npm install
3. Create an .env file
bash
Copy code
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/stacdex

# JWT
JWT_SECRET=your_jwt_secret

# AWS S3
AWS_REGION=us-east-2
S3_BUCKET=stacdex-images
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Server
PORT=3000
Important: Do not commit your .env file. It’s ignored automatically by .gitignore.

🧩 Package Dependencies
Core
express — web server framework

cors — enables frontend/backend communication

dotenv — loads environment variables

pg — PostgreSQL client

bcrypt — password hashing for authentication

jsonwebtoken — creates and verifies JWT tokens

nodemon — restarts server automatically during development

AWS & File Uploads
@aws-sdk/client-s3 — AWS S3 SDK for uploads and deletes

multer — handles multipart/form-data for file uploads

multer-s3 — streams files directly to S3 (optional)

Utility & Development
cross-env — manages environment variables across OSes

uuid (optional) — generates unique IDs

eslint / prettier (optional) — code linting and formatting

🧱 Database Schema Overview
Tables
users — stores user credentials and profile image URLs

categories — predefined card types (Football, Baseball, etc.)

status — listing states (Unlisted, Listed, Sold, etc.)

grading_companies — lookup for PSA, BGS, CGC, etc.

conditions — card condition (Mint, Near Mint, etc.)

items — main card table linked to users with full metadata

🧠 Core Features
JWT-based user authentication

Profile management with AWS S3 image upload

Full CRUD for cards (create, update, delete, search, filter)

Secure AWS S3 image uploads and deletions

Auto-delete S3 images when associated cards or users are deleted

Filter and sort cards by player, team, year, brand, and grade

Future-ready schema for analytics and AI enhancements

🧪 NPM Scripts
Command	Description
npm start	Run production server
npm run dev	Run development server with Nodemon
npm run db:schema	Apply schema.sql to local PostgreSQL
npm run db:seed	Seed test data into the database

📡 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/login	Authenticate and return JWT

Users
Method	Endpoint	Description
GET	/users/me	Get current user
PUT	/users/:id	Update user info
PUT	/users/:id/profile-image	Upload or update user profile image
DELETE	/users/:id	Delete user and associated image

Items
Method	Endpoint	Description
GET	/items	Get all cards
GET	/items/:id	Get specific card
POST	/items	Add new card with optional image
PUT	/items/:id	Update existing card or image
DELETE	/items/:id	Delete card and image from S3

☁️ Deployment Notes
Backend
Deployed on Render

Make sure environment variables are configured in Render

Frontend
Built with Vite

Connects to backend using the environment variable VITE_API_URL

🏁 Summary
StacDex is a full-stack platform designed for collectors — built with modern, modular architecture for scalability and security.
It includes secure authentication, AWS S3 image management, and a database optimized for analytics and future AI-driven automation.

👨‍💻 Author
Mark Spriggs
GitHub @MarkSpriggs
Full-stack developer focused on modern, scalable web applications for creators and collectors.