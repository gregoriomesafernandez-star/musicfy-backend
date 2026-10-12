# Musicfy Backend

REST API backend for the Musicfy music management application.

Built with Node.js, Express and MongoDB, this backend provides authentication, role-based access control, music management and file uploads for the Musicfy Angular frontend.

## Features

- User registration
- User login with JWT authentication
- User profile management
- Artist management
- Album management
- Song management
- Image upload
- Audio file upload
- Music playback
- Role-based access control
- REST API
- MongoDB database integration
- Automatic initial administrator creation

## Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- dotenv
- Nodemon

## Requirements

Before running the project, make sure you have installed:

- Node.js
- npm
- MongoDB

## Installation

Clone the repository:

```bash
git clone https://github.com/gregoriomesafernandez-star/musicfy-backend.git
```

Navigate to the project directory:

```bash
cd musicfy-backend
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/musicfy
JWT_SECRET=replace_with_a_secure_secret
ADMIN_EMAIL=admin@musicfy.local
ADMIN_PASSWORD=change_this_password
```

The `.env` file contains private configuration and should not be committed to the repository.

## Initial Administrator

When the application starts, it automatically checks whether an administrator exists.

If no administrator with the `ROLE_ADMIN` role exists, one is created using the credentials defined in:

```env
ADMIN_EMAIL
ADMIN_PASSWORD
```

## Running the Application

Start the backend with:

```bash
npm start
```

The server will run on:

```text
http://localhost:3000
```

## Database

The application uses MongoDB with the database:

```text
musicfy
```

The main entities are:

- User
- Artist
- Album
- Song

The relationship between music entities is:

```text
Artist
  └── Album
        └── Song
```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication.

After logging in, the client receives a JWT containing the authenticated user's information and role.

Protected endpoints require a valid authentication token.

The application also implements role-based access control:

- `ROLE_USER`
- `ROLE_ADMIN`

Administrative operations such as creating, editing and deleting artists, albums and songs require administrator privileges.

## File Uploads

Uploaded files are stored in the `uploads` directory.

```text
uploads/
├── albums/
│   └── default.png
├── artists/
│   └── default.png
├── songs/
└── users/
    └── default.png
```

Default images are included in the repository so the application can display a fallback image when no image is provided.

User-uploaded images and audio files are ignored by Git.

## Frontend

This backend is designed to work with the Musicfy Angular frontend.

Frontend repository:

`https://github.com/gregoriomesafernandez-star/musicfy-fronted.git`

The Angular application communicates with this API through HTTP requests.

## Author

Gregorio Jose Mesa Fernandez