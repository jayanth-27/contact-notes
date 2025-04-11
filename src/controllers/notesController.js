const db = require('../models/db');

/**
 * Normalize note fields
 * Transform various note field formats to a consistent format
 * e.g., note_body, note_text → body
 */
const normalizeNoteFields = (noteData) => {
  const normalized = { ...noteData };
  
  // Normalize body field
  if (normalized.note_body !== undefined) {
    normalized.body = normalized.note_body;
    delete normalized.note_body;
  }
  
  if (normalized.note_text !== undefined) {
    normalized.body = normalized.note_text;
    delete normalized.note_text;
  }
  
  if (normalized.content !== undefined) {
    normalized.body = normalized.content;
    delete normalized.content;
  }
  
  if (normalized.text !== undefined) {
    normalized.body = normalized.text;
    delete normalized.text;
  }
  
  return normalized;
};

/**
 * Get all notes for a contact
 */
exports.getNotes = async (req, res) => {
  try {
    // Verify the contact exists and belongs to the user
    const contact = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.contactId, req.user.id]
    );

    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or not authorized'
      });
    }

    const notes = await db.query(
      'SELECT * FROM notes WHERE contact_id = $1 ORDER BY created_at DESC',
      [req.params.contactId]
    );

    res.status(200).json({
      success: true,
      count: notes.rows.length,
      data: notes.rows
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single note
 */
exports.getNote = async (req, res) => {
  try {
    const note = await db.query(
      `SELECT n.* 
       FROM notes n
       JOIN contacts c ON n.contact_id = c.id
       WHERE n.id = $1 AND n.contact_id = $2 AND c.user_id = $3`,
      [req.params.id, req.params.contactId, req.user.id]
    );

    if (note.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: note.rows[0]
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new note
 */
exports.createNote = async (req, res) => {
  try {
    // Verify the contact exists and belongs to the user
    const contact = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.contactId, req.user.id]
    );

    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or not authorized'
      });
    }

    // Normalize incoming note data
    const normalizedData = normalizeNoteFields(req.body);

    if (!normalizedData.body) {
      return res.status(400).json({
        success: false,
        message: 'Note body is required'
      });
    }

    const newNote = await db.query(
      'INSERT INTO notes (contact_id, user_id, body) VALUES ($1, $2, $3) RETURNING *',
      [req.params.contactId, req.user.id, normalizedData.body]
    );

    res.status(201).json({
      success: true,
      data: newNote.rows[0]
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a note
 */
exports.updateNote = async (req, res) => {
  try {
    // Verify the note exists and belongs to a contact owned by the user
    const note = await db.query(
      `SELECT n.* 
       FROM notes n
       JOIN contacts c ON n.contact_id = c.id
       WHERE n.id = $1 AND n.contact_id = $2 AND c.user_id = $3`,
      [req.params.id, req.params.contactId, req.user.id]
    );

    if (note.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized'
      });
    }

    // Normalize incoming note data
    const normalizedData = normalizeNoteFields(req.body);

    if (!normalizedData.body) {
      return res.status(400).json({
        success: false,
        message: 'Note body is required'
      });
    }

    const updatedNote = await db.query(
      `UPDATE notes 
       SET body = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND contact_id = $3
       RETURNING *`,
      [normalizedData.body, req.params.id, req.params.contactId]
    );

    res.status(200).json({
      success: true,
      data: updatedNote.rows[0]
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a note
 */
exports.deleteNote = async (req, res) => {
  try {
    // Verify the note exists and belongs to a contact owned by the user
    const note = await db.query(
      `SELECT n.* 
       FROM notes n
       JOIN contacts c ON n.contact_id = c.id
       WHERE n.id = $1 AND n.contact_id = $2 AND c.user_id = $3`,
      [req.params.id, req.params.contactId, req.user.id]
    );

    if (note.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or not authorized'
      });
    }

    await db.query(
      'DELETE FROM notes WHERE id = $1 AND contact_id = $2',
      [req.params.id, req.params.contactId]
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 