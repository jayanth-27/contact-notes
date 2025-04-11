const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactsController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const timeout = require('../middleware/timeout');

// Include notes router for nested routes
const noteRouter = require('./noteRoutes');

const router = express.Router();

// Apply protection to all contact routes
router.use(protect);

// Apply rate limiting
router.use(apiLimiter);

// Apply timeout middleware
router.use(timeout());

// Re-route into note router when needed
router.use('/:contactId/notes', noteRouter);

// Contact routes
router
  .route('/')
  .get(getContacts)
  .post(createContact);

router
  .route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router; 