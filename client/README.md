
# Q-ease Queue Management System

A smart queue management system built with React (frontend) and Express.js/MongoDB (backend).

## Project Structure

The project is organized into two main folders:

- `client`: Contains the React frontend code
- `server`: Contains the Express.js backend code

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and JWT secret.

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the client directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Replacing Frontend Authentication with Backend

To integrate the frontend with the Express.js, Node.js, and MongoDB backend, follow these steps:

1. Update the authentication calls in the frontend to use your Express.js APIs:
   - Replace the local storage authentication in `src/utils/ProtectedRoute.jsx` with API calls to your backend
   - Update login and signup components to call your backend APIs

2. Update API calls in the user and admin dashboards:
   - Replace local state management with API calls to your backend for queue management

3. Implement the QR code scanning functionality using a library like `react-qr-reader`

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user or admin
- `POST /api/auth/login`: Login a user or admin

### Queues
- `POST /api/queues`: Create a new queue (admin only)
- `GET /api/queues/admin`: Get all queues for an admin
- `GET /api/queues/:id`: Get queue details by ID
- `POST /api/queues/join`: Join a queue (user only)
- `POST /api/queues/:id/leave`: Leave a queue (user only)
- `POST /api/queues/:id/serve/:userId`: Serve a user in the queue (admin only)

### Users
- `GET /api/users/profile`: Get user profile
- `GET /api/users/queues`: Get user's joined queues
