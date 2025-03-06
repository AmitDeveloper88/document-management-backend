Here's the complete README.md with project overview, setup instructions, and detailed API documentation:

```markdown:c:\Users\capta\OneDrive\Desktop\side project\doc-manager\README.md
# Document Manager API

A robust document management system built with NestJS, featuring user authentication, role-based access control, and document ingestion capabilities.

## Features

- **Authentication System**
  - Secure user registration and login
  - JWT-based authentication
  - Role-based access control (Admin, Editor, Viewer)

- **User Management**
  - User role management
  - Admin-only user controls
  - Secure password handling

- **Document Management**
  - Document upload and storage
  - Metadata management
  - Role-based document access
  - File versioning

- **Document Ingestion**
  - Automated processing triggers
  - Status tracking
  - Process management

## Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT Authentication
- Multer (File Upload)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd doc-manager
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file with:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=admin
DATABASE_NAME=doc_manager
JWT_SECRET=your_super_secret_key_here
```

4. Start the application
```bash
npm run start:dev
```

## API Documentation

### Authentication APIs

#### Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
    "email": "user@example.com",
    "password": "password123",
    "role": "viewer"
}

Response:
{
    "id": 1,
    "email": "user@example.com",
    "role": "viewer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
    "email": "user@example.com",
    "password": "password123"
}

Response:
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "viewer"
    }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>

Response:
{
    "message": "Logged out successfully"
}
```

### User Management APIs

#### Get All Users (Admin only)
```http
GET /users
Authorization: Bearer <jwt_token>

Response:
[
    {
        "id": 1,
        "email": "admin@example.com",
        "role": "admin"
    },
    {
        "id": 2,
        "email": "editor@example.com",
        "role": "editor"
    }
]
```

#### Update User Role (Admin only)
```http
POST /users/:id/role
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request Body:
{
    "role": "editor"
}

Response:
{
    "id": 2,
    "email": "editor@example.com",
    "role": "editor"
}
```

### Document Management APIs

#### Upload Document
```http
POST /documents
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- title: "Document Title"
- file: (file)

Response:
{
    "id": 1,
    "title": "Document Title",
    "filePath": "uploads/filename.pdf",
    "isProcessed": false,
    "createdAt": "2024-03-06T10:00:00.000Z",
    "owner": {
        "id": 1,
        "email": "user@example.com"
    }
}
```

#### Get All Documents
```http
GET /documents
Authorization: Bearer <jwt_token>

Response:
[
    {
        "id": 1,
        "title": "Document Title",
        "filePath": "uploads/filename.pdf",
        "isProcessed": false,
        "createdAt": "2024-03-06T10:00:00.000Z",
        "owner": {
            "id": 1,
            "email": "user@example.com"
        }
    }
]
```

#### Get Single Document
```http
GET /documents/:id
Authorization: Bearer <jwt_token>

Response:
{
    "id": 1,
    "title": "Document Title",
    "filePath": "uploads/filename.pdf",
    "isProcessed": false,
    "createdAt": "2024-03-06T10:00:00.000Z",
    "owner": {
        "id": 1,
        "email": "user@example.com"
    }
}
```

#### Update Document
```http
PUT /documents/:id
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- title: "Updated Title"
- file: (optional file)

Response:
{
    "id": 1,
    "title": "Updated Title",
    "filePath": "uploads/filename.pdf",
    "isProcessed": false,
    "updatedAt": "2024-03-06T11:00:00.000Z"
}
```

#### Delete Document
```http
DELETE /documents/:id
Authorization: Bearer <jwt_token>

Response:
{
    "statusCode": 200,
    "message": "Document deleted successfully"
}
```

### Ingestion APIs

#### Trigger Document Ingestion
```http
POST /documents/:id/trigger-ingestion
Authorization: Bearer <jwt_token>

Response:
{
    "id": 1,
    "status": "pending",
    "documentId": 1,
    "createdAt": "2024-03-06T10:00:00.000Z"
}
```

#### Get Ingestion Status
```http
GET /ingestion/documents/:id/status
Authorization: Bearer <jwt_token>

Response:
{
    "id": 1,
    "status": "completed",
    "documentId": 1,
    "createdAt": "2024-03-06T10:00:00.000Z",
    "completedAt": "2024-03-06T10:01:00.000Z"
}
```

#### Get All Ingestions (Admin only)
```http
GET /ingestion/status
Authorization: Bearer <jwt_token>

Response:
[
    {
        "id": 1,
        "status": "completed",
        "documentId": 1,
        "createdAt": "2024-03-06T10:00:00.000Z",
        "completedAt": "2024-03-06T10:01:00.000Z"
    }
]
```

## Error Responses

All endpoints may return these error responses:

### Unauthorized Access
```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```

### Forbidden Access
```json
{
    "statusCode": 403,
    "message": "Forbidden"
}
```

### Resource Not Found
```json
{
    "statusCode": 404,
    "message": "Not Found"
}
```

### Validation Error
```json
{
    "statusCode": 400,
    "message": ["validation error messages"]
}
```

## Development

### Running Tests
```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```


