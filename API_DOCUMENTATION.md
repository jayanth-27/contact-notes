# Contact Notes API Documentation

## Overview

The Contact Notes API provides functionality to manage contacts and associated notes. The API requires authentication and follows RESTful principles.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication. To access protected endpoints, you must include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register a new user

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Rate limit**: Yes

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "<jwt_token>"
  }
}
```

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Rate limit**: Yes

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "<jwt_token>"
  }
}
```

#### Get Current User

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2023-05-20T14:22:10.500Z"
  }
}
```

## Contacts

### Contact Endpoints

#### Get All Contacts

- **URL**: `/contacts`
- **Method**: `GET`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "company": "ACME Inc",
      "job_title": "Marketing Manager",
      "address": "123 Main St, City, Country",
      "created_at": "2023-05-20T15:30:10.500Z",
      "updated_at": "2023-05-20T15:30:10.500Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "first_name": "Jack",
      "last_name": "Smith",
      "email": "jack@example.com",
      "phone": "9876543210",
      "company": "XYZ Corp",
      "job_title": "Sales Director",
      "address": "456 Oak St, City, Country",
      "created_at": "2023-05-21T10:15:20.500Z",
      "updated_at": "2023-05-21T10:15:20.500Z"
    }
  ]
}
```

#### Get Single Contact

- **URL**: `/contacts/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "1234567890",
    "company": "ACME Inc",
    "job_title": "Marketing Manager",
    "address": "123 Main St, City, Country",
    "created_at": "2023-05-20T15:30:10.500Z",
    "updated_at": "2023-05-20T15:30:10.500Z"
  }
}
```

#### Create Contact

- **URL**: `/contacts`
- **Method**: `POST`
- **Auth required**: Yes
- **Rate limit**: Yes

**Request Body**:

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "company": "ACME Inc",
  "job_title": "Marketing Manager",
  "address": "123 Main St, City, Country"
}
```

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "1234567890",
    "company": "ACME Inc",
    "job_title": "Marketing Manager",
    "address": "123 Main St, City, Country",
    "created_at": "2023-05-20T15:30:10.500Z",
    "updated_at": "2023-05-20T15:30:10.500Z"
  }
}
```

#### Update Contact

- **URL**: `/contacts/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **Rate limit**: Yes

**Request Body**:

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "company": "ACME Corporation"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "1234567890",
    "company": "ACME Corporation",
    "job_title": "Marketing Manager",
    "address": "123 Main St, City, Country",
    "created_at": "2023-05-20T15:30:10.500Z",
    "updated_at": "2023-05-21T09:45:22.300Z"
  }
}
```

#### Delete Contact

- **URL**: `/contacts/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {}
}
```

## Notes

### Note Endpoints

#### Get All Notes for a Contact

- **URL**: `/contacts/:contactId/notes`
- **Method**: `GET`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "contact_id": 1,
      "user_id": 1,
      "body": "Discussed marketing plan for Q3",
      "created_at": "2023-05-21T16:30:10.500Z",
      "updated_at": "2023-05-21T16:30:10.500Z"
    },
    {
      "id": 2,
      "contact_id": 1,
      "user_id": 1,
      "body": "Follow up on website redesign project",
      "created_at": "2023-05-22T10:15:20.500Z",
      "updated_at": "2023-05-22T10:15:20.500Z"
    }
  ]
}
```

#### Get Single Note

- **URL**: `/contacts/:contactId/notes/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "contact_id": 1,
    "user_id": 1,
    "body": "Discussed marketing plan for Q3",
    "created_at": "2023-05-21T16:30:10.500Z",
    "updated_at": "2023-05-21T16:30:10.500Z"
  }
}
```

#### Create Note

- **URL**: `/contacts/:contactId/notes`
- **Method**: `POST`
- **Auth required**: Yes
- **Rate limit**: Yes

**Request Body**:

```json
{
  "body": "Discussed marketing plan for Q3"
}
```

**Note**: The API also accepts alternative field names for backward compatibility:
- `note_body`
- `note_text`
- `content`
- `text`

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "contact_id": 1,
    "user_id": 1,
    "body": "Discussed marketing plan for Q3",
    "created_at": "2023-05-21T16:30:10.500Z",
    "updated_at": "2023-05-21T16:30:10.500Z"
  }
}
```

#### Update Note

- **URL**: `/contacts/:contactId/notes/:id`
- **Method**: `PUT`
- **Auth required**: Yes
- **Rate limit**: Yes

**Request Body**:

```json
{
  "body": "Discussed marketing plan for Q3 and agreed on budget"
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "contact_id": 1,
    "user_id": 1,
    "body": "Discussed marketing plan for Q3 and agreed on budget",
    "created_at": "2023-05-21T16:30:10.500Z",
    "updated_at": "2023-05-22T14:45:22.300Z"
  }
}
```

#### Delete Note

- **URL**: `/contacts/:contactId/notes/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **Rate limit**: Yes

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {}
}
```

## Error Responses

The API returns appropriate error responses for invalid requests:

### Bad Request (400)

```json
{
  "success": false,
  "message": "Please provide at least first and last name"
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Not Found (404)

```json
{
  "success": false,
  "message": "Contact not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Authentication endpoints: 10 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

## API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {...},
  "count": 2  // Only for listing endpoints
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here"
}
``` 