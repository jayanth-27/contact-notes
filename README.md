# Contact Notes Service

A microservice for managing contact notes within a CRM system.

## Features

- Create and manage notes associated with contacts
- Note processing for performing analysis and updates
- RESTful API for CRUD operations
- Authentication and authorization
- Comprehensive test suite

## Technology Stack

- Node.js and Express
- PostgreSQL database
- Jest for testing
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/contact-notes-service.git
cd contact-notes-service
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations
```bash
npm run migrate
```

5. Start the server
```bash
npm start
```

For development:
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Notes
- `GET /api/notes/:id` - Get a specific note
- `GET /api/contacts/:contactId/notes` - Get all notes for a contact
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Note Processing

When a note is created, the service performs the following processing:
- Updates the note status to 'processed'
- Logs details about the processing
- Can be extended to include more advanced processing like:
  - Text analysis
  - Sentiment analysis 
  - Keyword extraction
  - Notifications
  - Search indexing

## Testing

To run tests:
```bash
npm test
```

To run tests in watch mode:
```bash
npm run test:watch
```

## Folder Structure

```
contact-notes-service/
├── src/
│   ├── __tests__/        # Test files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── workers/          # Processing workers
│   └── app.js            # Express app setup
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
└── README.md             # Project documentation
```