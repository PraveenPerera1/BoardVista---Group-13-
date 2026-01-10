# BoardVista Backend API

Backend API for BoardVista mobile application - a boarding house discovery platform for Vavuniya.

## Features

- User Authentication (Register/Login)
- Boarding House Management (CRUD operations)
- Review and Rating System
- Chat/Messaging System
- Location-based Search
- Role-based Access Control

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the server:
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Boarding Houses
- `GET /api/boarding` - Get all boarding houses (with filters)
- `GET /api/boarding/nearby` - Get nearby boarding houses
- `GET /api/boarding/my` - Get my boarding houses (owners only)
- `GET /api/boarding/:id` - Get single boarding house
- `POST /api/boarding` - Create boarding house (owners only)
- `PUT /api/boarding/:id` - Update boarding house (owners only)
- `DELETE /api/boarding/:id` - Delete boarding house (owners only)

### Reviews
- `GET /api/reviews` - Get reviews (with filters)
- `POST /api/reviews` - Create review (authenticated users)
- `PUT /api/reviews/:id` - Update review (review author only)
- `DELETE /api/reviews/:id` - Delete review (review author only)

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id` - Get single chat
- `POST /api/chat/:id` - Send message
- `PUT /api/chat/:id` - Mark messages as read

## Query Parameters

### Boarding Houses Filters
- `gender` - Filter by gender (male, female, co-ed)
- `city` - Filter by city
- `minPrice` - Minimum monthly price
- `maxPrice` - Maximum monthly price
- `facilities` - Comma-separated list of facilities
- `isVerified` - Filter by verification status
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Nearby Search
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `maxDistance` - Maximum distance in meters (default: 10000)

## Data Models

### User
- name, email, password, role (user/owner), phone, profileImage

### BoardingHouse
- title, description, owner, address, coordinates, price, facilities, roomTypes, images, rules, gender, availability

### Review
- user, boardingHouse, rating, title, comment, detailed ratings, images

### Chat
- participants, boardingHouse, messages, lastMessage, isActive

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors if any
}
```

## Development

The server runs on port 5000 by default. Make sure your MongoDB instance is running and properly configured in the `.env` file.
