const db = require('../models/db');
const processNote = require('../workers/noteProcessor');

async function createNote(req, res) {
  try {
    const { contact_id, body } = req.body;
    const user_id = req.user.id;

    // Check if contact exists
    const contactResult = await db.query(
      'SELECT id FROM contacts WHERE id = $1',
      [contact_id]
    );

    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Create note
    const noteResult = await db.query(
      `INSERT INTO notes (contact_id, user_id, body, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, contact_id, user_id, body, created_at, status`,
      [contact_id, user_id, body, 'pending']
    );

    const newNote = noteResult.rows[0];

    // Directly process the note
    await processNote(newNote);

    return res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all notes for a contact
async function getNotesByContact(req, res) {
  try {
    const { contact_id } = req.params;
    
    const notesResult = await db.query(
      `SELECT n.*, u.name as user_name
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.contact_id = $1
       ORDER BY n.created_at DESC`,
      [contact_id]
    );
    
    return res.json(notesResult.rows);
  } catch (error) {
    console.error('Error retrieving notes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get a specific note
async function getNoteById(req, res) {
  try {
    const { id } = req.params;
    
    const noteResult = await db.query(
      `SELECT n.*, u.name as user_name
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE n.id = $1`,
      [id]
    );
    
    if (noteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    return res.json(noteResult.rows[0]);
  } catch (error) {
    console.error('Error retrieving note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createNote,
  getNotesByContact,
  getNoteById
}; 