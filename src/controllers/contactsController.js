const db = require('../models/db');

/**
 * Get all contacts for the authenticated user
 */
exports.getContacts = async (req, res) => {
  try {
    const contacts = await db.query(
      'SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: contacts.rows.length,
      data: contacts.rows
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single contact
 */
exports.getContact = async (req, res) => {
  try {
    const contact = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact.rows[0]
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new contact
 */
exports.createContact = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      job_title,
      address
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least first and last name'
      });
    }

    const newContact = await db.query(
      `INSERT INTO contacts 
        (user_id, first_name, last_name, email, phone, company, job_title, address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        req.user.id, 
        first_name, 
        last_name, 
        email || null, 
        phone || null, 
        company || null, 
        job_title || null, 
        address || null
      ]
    );

    res.status(201).json({
      success: true,
      data: newContact.rows[0]
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a contact
 */
exports.updateContact = async (req, res) => {
  try {
    // First verify the contact exists and belongs to this user
    const contact = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or not authorized'
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      job_title,
      address
    } = req.body;

    // Perform the update with the existing values as fallback
    const existingContact = contact.rows[0];
    const updatedContact = await db.query(
      `UPDATE contacts 
       SET first_name = $1, 
           last_name = $2, 
           email = $3, 
           phone = $4, 
           company = $5, 
           job_title = $6, 
           address = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        first_name || existingContact.first_name,
        last_name || existingContact.last_name,
        email !== undefined ? email : existingContact.email,
        phone !== undefined ? phone : existingContact.phone,
        company !== undefined ? company : existingContact.company,
        job_title !== undefined ? job_title : existingContact.job_title,
        address !== undefined ? address : existingContact.address,
        req.params.id,
        req.user.id
      ]
    );

    res.status(200).json({
      success: true,
      data: updatedContact.rows[0]
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a contact
 */
exports.deleteContact = async (req, res) => {
  try {
    // First verify the contact exists and belongs to this user
    const contact = await db.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (contact.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found or not authorized'
      });
    }

    // Delete the contact
    // Notes will be automatically deleted via ON DELETE CASCADE
    await db.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 