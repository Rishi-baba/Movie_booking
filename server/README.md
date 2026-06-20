# Movie Ticket Reservation Backend

This is the backend foundation for a scalable Movie Ticket Reservation application, built with Node.js, Express, and MongoDB.

## Features Included
- **ES Modules** syntax (`import`/`export`)
- **Express Server** with common middlewares (cors, morgan, express.json, cookie-parser)
- **MongoDB** integration using Mongoose
- **Centralized Error Handling**
- **JWT Authentication** setup
- **Mongoose Models** for User, Movie, Theatre, Show, and Booking
- **RESTful Route Skeleton**

## Folder Structure

```
server/
├── src/
│   ├── config/          # Configuration files (e.g., database connection)
│   ├── controllers/     # Route handlers containing business logic
│   ├── middleware/      # Custom Express middlewares (auth, error handling)
│   ├── models/          # Mongoose schemas/models
│   ├── routes/          # Express route definitions
│   ├── utils/           # Utility functions and classes
│   ├── app.js           # Express app setup and middleware configuration
│   └── server.js        # Entry point to start the server
├── .env                 # Environment variables
├── .gitignore           # Ignored files for Git
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Installation

1. Clone the repository and navigate to the `server` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Ensure you have a `.env` file in the root of the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/movie-booking
JWT_SECRET=your_super_secret_jwt_key
```

## Running the Application

To start the server in development mode (with hot reloading via `nodemon`):
```bash
npm run dev
```

To start the server in production mode:
```bash
npm start
```
