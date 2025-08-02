# Auth Mini Project

A simple authentication system with user registration and login functionality.

## What This Project Teaches

- **User Registration**: Creating new accounts with password hashing
- **User Login**: Authenticating users with username/password
- **JWT Tokens**: Secure authentication tokens
- **Password Security**: Using bcrypt for password hashing
- **Database Operations**: SQLite with Sequelize ORM
- **API Routes**: RESTful endpoints for authentication
- **Frontend Integration**: HTML forms with JavaScript

## Project Structure

```
auth-mini-project/
├── package.json          # Dependencies and scripts
├── server.js            # Main server file (Fastify)
├── database.js          # Database setup (SQLite + Sequelize)
├── auth.js              # Authentication functions
├── users.sqlite         # Database file (created automatically)
└── public/
    ├── index.html       # Main page with login/register forms
    └── app.js           # Frontend JavaScript
```

## How to Run

1. **Install dependencies**:
   ```bash
   cd auth-mini-project
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open your browser**:
   Go to `http://localhost:3001`

## Features

✅ **User Registration**
- Create new accounts
- Password hashing with bcrypt
- Duplicate username prevention

✅ **User Login**
- Authenticate with username/password
- JWT token generation
- Secure session management

✅ **Protected Routes**
- JWT token verification
- User information retrieval

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user info (requires authentication)

## Database Schema

**Users Table**:
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `email` - Optional email
- `displayName` - Optional display name

## Learning Path

1. **Start with `package.json`** - See what dependencies we use
2. **Read `database.js`** - Understand database setup
3. **Study `auth.js`** - Learn authentication functions
4. **Examine `server.js`** - See how routes are set up
5. **Check `public/index.html`** - Understand the frontend
6. **Review `public/app.js`** - See how frontend communicates with backend

## Key Concepts

- **Password Hashing**: Never store plain text passwords
- **JWT Tokens**: Stateless authentication
- **SQL Injection Prevention**: Using Sequelize ORM
- **Error Handling**: Proper HTTP status codes
- **Input Validation**: Check required fields

This mini project contains only the essential authentication features, making it perfect for learning!
