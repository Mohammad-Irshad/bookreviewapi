# Book Review API

A RESTful API for a Book Review system built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Book management (add, list, view details)
- Review system (add, update, delete reviews)
- Search functionality
- Pagination and filtering

## Database Schema

### User

- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- timestamps

### Book

- title (String, required)
- author (String, required)
- genre (String, required)
- description (String, required)
- publishedYear (Number)
- isbn (String)
- createdBy (ObjectId, ref: User)
- timestamps
- Virtual fields:
  - reviews (Array of Review objects)
  - averageRating (Calculated from reviews)

### Review

- book (ObjectId, ref: Book)
- user (ObjectId, ref: User)
- rating (Number, required, 1-5)
- text (String, required)
- timestamps
- Compound index on book and user to ensure one review per user per book

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a `.env` file based on `.env.example` and fill in your MongoDB URI and JWT secret
4. Start the server:
   \`\`\`
   npm start
   \`\`\`

## API Endpoints

### Authentication

- `POST /api/signup` - Register a new user
  \`\`\`
  curl -X POST http://localhost:5000/api/signup \
   -H "Content-Type: application/json" \
   -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
  \`\`\`

- `POST /api/login` - Login and get JWT token
  \`\`\`
  curl -X POST http://localhost:5000/api/login \
   -H "Content-Type: application/json" \
   -d '{"email": "test@example.com", "password": "password123"}'
  \`\`\`

### Books

- `POST /api/books` - Add a new book (Authenticated)
  \`\`\`
  curl -X POST http://localhost:5000/api/books \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "genre": "Classic", "description": "A novel about the American Dream", "publishedYear": 1925, "isbn": "9780743273565"}'
  \`\`\`

- `GET /api/books` - Get all books (with pagination and filters)
  \`\`\`
  curl "http://localhost:5000/api/books?page=1&limit=10&author=Fitzgerald&genre=Classic"
  \`\`\`

- `GET /api/books/:id` - Get book details by ID
  \`\`\`
  curl http://localhost:5000/api/books/BOOK_ID
  \`\`\`

- `POST /api/books/:id/reviews` - Submit a review (Authenticated)
  \`\`\`
  curl -X POST http://localhost:5000/api/books/BOOK_ID/reviews \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"rating": 5, "text": "An amazing book that captures the essence of the 1920s."}'
  \`\`\`

### Reviews

- `PUT /api/reviews/:id` - Update your review (Authenticated)
  \`\`\`
  curl -X PUT http://localhost:5000/api/reviews/REVIEW_ID \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"rating": 4, "text": "Updated review text."}'
  \`\`\`

- `DELETE /api/reviews/:id` - Delete your review (Authenticated)
  \`\`\`
  curl -X DELETE http://localhost:5000/api/reviews/REVIEW_ID \
   -H "Authorization: Bearer YOUR_TOKEN"
  \`\`\`

### Search

- `GET /api/search` - Search books by title or author
  \`\`\`
  curl "http://localhost:5000/api/search?query=Gatsby&page=1&limit=10"
  \`\`\`

## Design Decisions

1. **Authentication**: JWT-based authentication was chosen for its stateless nature and ease of implementation.

2. **Database Schema**: The schema was designed to efficiently support the required operations:

   - One-to-many relationship between users and books
   - One-to-many relationship between books and reviews
   - Compound index on book and user in the Review model to ensure one review per user per book

3. **Pagination**: Implemented for both book listings and reviews to improve performance with large datasets.

4. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes.

5. **Virtual Fields**: Used Mongoose virtual fields for calculated properties like average rating.
   \`\`\`
