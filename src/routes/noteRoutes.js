const express = require('express');
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');
const { apiLimiter, simulateExternalServiceLimiter } = require('../middleware/rateLimiter');
const timeout = require('../middleware/timeout');

// mergeParams allows access to params from parent router
const router = express.Router({ mergeParams: true });

// Apply protection to all note routes
router.use(protect);

// Apply rate limiting
router.use(apiLimiter);

// Apply timeout middleware
router.use(timeout());

// Apply simulated external service rate limiting for demonstration
router.use(simulateExternalServiceLimiter);

// Note routes
router
  .route('/')
  .get(getNotes)
  .post(createNote);

router
  .route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router; 