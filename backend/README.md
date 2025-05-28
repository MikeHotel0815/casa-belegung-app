# Backend Service

## Overview/Description

This backend service provides a RESTful API for user authentication and managing items. It uses Node.js, Express, Sequelize ORM for database interaction (with MariaDB/MySQL), and JWT for authentication.

## Prerequisites

*   Node.js and npm (Node Package Manager) installed.
*   MariaDB (or MySQL) server installed and running locally or accessible.

## Setup and Installation

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
    (If you've cloned a repository, ensure you are in the `backend` sub-directory).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

### Database Connection

*   Database connection details are configured in `config/config.json`.
*   For the `development` environment, ensure the settings match your local MariaDB/MySQL setup. You might need to adjust `username`, `password`, `database`, and `host`.

    **Example `development` configuration in `config/config.json`:**
    ```json
    "development": {
      "username": "root",
      "password": "your_password",
      "database": "myapp_dev",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
    ```
    **Important**: Change `"your_password"` to your actual MariaDB/MySQL root password or the password for the specified user.

*   **Create the database** (e.g., `myapp_dev`) in your MariaDB/MySQL instance if it doesn't already exist.
    ```sql
    -- Example SQL command for MariaDB/MySQL
    CREATE DATABASE myapp_dev;
    ```
    Alternatively, if your database user has the necessary permissions, the `npm run db:create` script can attempt to create the development database as defined in `config/config.json`.
    ```bash
    npm run db:create
    ```

### JWT Secret

*   The JWT (JSON Web Token) secret is currently hardcoded as `'YOUR_SECRET_KEY'` in:
    *   `routes/auth.js`
    *   `middleware/authMiddleware.js`
*   **For production, this secret MUST be moved to an environment variable** (e.g., `JWT_SECRET`) for security. Do not use the hardcoded secret in a live environment.

## Database Migrations

Migrations are used to set up and update your database schema.

*   **Run migrations** to create the necessary tables (Users, Items):
    ```bash
    npm run db:migrate
    ```

*   **(Optional) Roll back the last migration**:
    ```bash
    npm run db:migrate:undo
    ```

*   **(Optional) Seeding the database** (if seeders are created):
    This command will run all seeder files to populate the database with initial data.
    ```bash
    npm run db:seed:all
    ```

## Running the Application

*   **Development mode**:
    Starts the server using `nodemon`, which automatically restarts the application when file changes are detected.
    ```bash
    npm run dev
    ```

*   **Production mode**:
    Starts the server in a standard way. Ensure `NODE_ENV` is set to `production`.
    ```bash
    npm run start
    ```

*   The server will run on the port specified by `process.env.PORT` or default to **3001**.

## API Endpoints

### Authentication (`/auth`)

*   `POST /auth/register`
    *   Registers a new user.
    *   Request body: `{ "username": "your_username", "password": "your_password" }`
*   `POST /auth/login`
    *   Logs in an existing user.
    *   Request body: `{ "username": "your_username", "password": "your_password" }`
    *   Returns a JWT upon successful authentication.

### Items (`/api/items`)

These routes are protected and require a JWT Bearer token in the `Authorization` header.
`Authorization: Bearer <your_jwt_token>`

*   `GET /api/items`
    *   Retrieves all items for the authenticated user.
*   `POST /api/items`
    *   Creates a new item for the authenticated user.
    *   Request body: `{ "name": "Item Name", "description": "Item description (optional)" }`
*   `GET /api/items/:id`
    *   Retrieves a specific item by its ID, belonging to the authenticated user.
*   `PUT /api/items/:id`
    *   Updates a specific item by its ID, belonging to the authenticated user.
    *   Request body: `{ "name": "Updated Name", "description": "Updated description" }`
*   `DELETE /api/items/:id`
    *   Deletes a specific item by its ID, belonging to the authenticated user.

## Error Handling

*   The application includes a basic error handling middleware that catches unhandled errors.
*   Errors are returned in JSON format, typically including a `message` field and sometimes a `stack` trace in development.

## Environment Variables (Summary for Production)

For a production deployment, the following environment variables should be configured:

*   `NODE_ENV`: Set to `production`. This optimizes performance and can affect how some dependencies behave (e.g., error logging).
*   `DATABASE_URL`: The connection string for your production database.
    *   Example: `mysql://your_db_user:your_db_password@your_db_host:your_db_port/your_db_name`
    *   This is used if `config.production.use_env_variable` is set to `"DATABASE_URL"` in `config/config.json`.
*   `JWT_SECRET`: A strong, unique secret key for signing and verifying JSON Web Tokens.
*   `PORT`: (Optional) The port number on which the server should listen. Defaults to 3001 if not set.

---
This README provides a guide for setting up, configuring, and running the backend service.
