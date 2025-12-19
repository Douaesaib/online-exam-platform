# Online Exam Platform

Plateforme d'examen en ligne (Online Exam Platform) built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Exam Management**: Create, read, update, and delete exams.
- **Question Bank**: Manage questions for exams.
- **Results Tracking**: Track and view exam results.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs, cors
- **File Handling**: multer

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (Local or Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-exam-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/online-exam-platform
   JWT_SECRET=your_jwt_secret_key
   ```

## Usage

### Development Mode
Run the server with nodemon for auto-reloading:
```bash
npm run dev
```

### Production Mode
Start the server normally:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

- **Auth**: `/api/auth`
- **Exams**: `/api/exams`
- **Questions**: `/api/questions`
- **Results**: `/api/results`

## License

ISC
