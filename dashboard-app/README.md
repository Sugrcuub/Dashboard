# Simple Admin Dashboard with Role‑Based Access Control

This repository contains a full‑stack web application that implements a simple dashboard with user authentication, role‑based access control and basic CRUD functionality.  The project is designed to be imported directly into Replit or another Node.js environment and uses a React frontend with an Express/SQLite backend.

## Features

- **User Authentication** – Users can sign in with a username and password.  The backend uses JSON Web Tokens (JWT) for stateless authentication.  After a successful login the server returns a signed JWT; the client stores it and sends it with every protected request.  The technology stack intentionally uses Node.js and Express with JWT, bcryptjs and CORS as recommended for secure APIs【178073498292057†L64-L76】.
- **Role‑Based Access Control** – Middleware enforces that only users with the required roles can access protected endpoints.  For example, the `/login` route is public; the `/api/users` route is restricted to administrators; the `/api/records` endpoints return either all records (for administrators) or only those belonging to the current user.  The concept follows the tutorial model where an admin can access all user records while other roles can only access their own【969759548063850†L27-L41】.
- **SQLite Data Storage** – A lightweight SQLite database stores users and records.  Passwords are hashed using bcryptjs.
- **RESTful API** – The backend exposes REST endpoints to list, create, edit and delete both users and records.  Admin‑level endpoints are protected by role checks.  Sorting and filtering can be done with query parameters.
- **React Frontend** – The client is built with React and React Router.  It includes pages for login, user dashboard and admin panel.  The admin panel provides forms for managing users and records.  Client‑side code handles form validation, table sorting and basic filtering.
- **Security Best Practices** – Sensitive secrets such as JWT secrets and database paths are loaded from environment variables using dotenv and are not hard‑coded.  JWTs include expiration times and Helmet is used to set secure HTTP headers.  These are part of recommended best practices for securing Node.js backends【178073498292057†L133-L139】.
- **Deployment Ready** – The repository includes scripts for development and production.  A `.replit` file and `replit.nix` configuration are provided for easy import into Replit.  You can run both the server and client concurrently during development.

## Getting Started

### Prerequisites

- **Node.js** (version 18 or newer recommended)
- **npm** package manager

### Environment variables

Create a `server/.env` file based on `server/.env.example`.  At a minimum you should set:

```env
PORT=5000
JWT_SECRET=your-very-secret-string
DB_FILE=./database.sqlite
```

`JWT_SECRET` is used to sign JWTs, so choose a long random string.  The documentation on JWT authentication notes that secrets should be stored in environment variables and not in source code【178073498292057†L133-L139】.

### Installation

1. Install dependencies for the root, client and server:

   ```bash
   npm install
   npm run install-all
   ```

2. Seed the database and start the development servers concurrently:

   ```bash
   npm run dev
   ```

   This will start the API server on the port specified in your `.env` file (default `5000`) and the React frontend on port `3000`.  You can then access the application in your browser at `http://localhost:3000/`.

### Scripts

The root `package.json` provides several scripts:

- `npm run server` – start the Express API only.
- `npm run client` – start the React development server only.
- `npm run dev` – run both client and server concurrently.
- `npm run build` – build the React app for production into `client/build`.  After building, you can serve the static files using the Express server.

### Deployment

For a simple deployment you can run:

```bash
npm run build       # build the React frontend
npm run server      # start the API server, which will serve static assets from client/build
```

If you deploy on Replit the included `.replit` and `replit.nix` files automatically configure the environment to run `npm run dev`.

### Default accounts

When the database is first initialized it contains two sample accounts:

- `admin` / `admin123` – an administrator who can manage users and records.
- `user` / `user123` – a regular user who can only view records assigned to them.

You can create additional users via the admin panel.

## Project Structure

```
dashboard-app/
├── client/          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
├── server/          # Express backend
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   ├── server.js
│   ├── .env.example
│   ├── package.json
├── .replit          # Replit run configuration
├── replit.nix       # Replit environment definition
├── package.json     # Root scripts for running both server and client
└── README.md        # This file
```

## Security Considerations

This project follows several security measures:

- **JWT best practices** – Each request to a protected route must include a JWT in the `Authorization` header.  The token is validated by middleware and only then is the user ID and role attached to the request.  If the token is missing or invalid the server returns a `401 Unauthorized` response.  Using JWTs for stateless authentication and verifying them in middleware is part of modern Node.js security guidance【178073498292057†L103-L112】.
- **Role checks** – Additional middleware restricts certain routes to specific roles (e.g. admin only).  As illustrated in the role‑based authorization tutorial, restricting routes based on roles ensures that administrators can access all records while regular users can only see their own【969759548063850†L27-L41】.
- **Environment variables and headers** – Sensitive configuration such as the JWT secret and database credentials are loaded from environment variables.  Helmet is used to set HTTP headers like `X‑Frame‑Options`, `X‑Content‑Type‑Options` and others for better security【178073498292057†L133-L139】.

Feel free to extend the functionality (e.g., adding refresh tokens or more granular permissions) based on your project requirements.