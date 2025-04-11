const db = require('../../models/db');
const processNote = require('../../workers/noteProcessor');

// Mock dependencies
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

jest.mock('../../workers/noteProcessor', () => jest.fn());

const noteController = require('../../controllers/noteController');

describe('Note Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockReq = {
      body: {},
      user: { id: 1 }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createNote', () => {
    it('should create a note and process it successfully', async () => {
      // Setup
      mockReq.body = {
        contact_id: 123,
        body: 'Test note content'
      };

      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // Contact exists
        .mockResolvedValueOnce({ 
          rows: [{
            id: 456,
            contact_id: 123,
            user_id: 1,
            body: 'Test note content',
            created_at: new Date(),
            status: 'pending'
          }]
        }); // Note created

      // Mock processNote response
      processNote.mockResolvedValueOnce({
        success: true,
        noteId: 456,
        message: 'Note processed successfully'
      });

      // Execute
      await noteController.createNote(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(processNote).toHaveBeenCalledWith(expect.objectContaining({
        id: 456,
        contact_id: 123,
        user_id: 1,
        body: 'Test note content'
      }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 456,
        contact_id: 123
      }));
    });

    it('should return 404 if contact not found', async () => {
      // Setup
      mockReq.body = {
        contact_id: 999,
        body: 'Test note content'
      };

      // Mock database response - contact not found
      db.query.mockResolvedValueOnce({ rows: [] });

      // Execute
      await noteController.createNote(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(processNote).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Contact not found' });
    });

    it('should handle database errors properly', async () => {
      // Setup
      mockReq.body = {
        contact_id: 123,
        body: 'Test note content'
      };

      // Mock database error
      db.query.mockRejectedValueOnce(new Error('Database error'));

      // Execute
      await noteController.createNote(mockReq, mockRes);

      // Verify
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should handle processing errors properly', async () => {
      // Setup
      mockReq.body = {
        contact_id: 123,
        body: 'Test note content'
      };

      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // Contact exists
        .mockResolvedValueOnce({ 
          rows: [{
            id: 456,
            contact_id: 123,
            user_id: 1,
            body: 'Test note content',
            created_at: new Date(),
            status: 'pending'
          }]
        }); // Note created

      // Mock processNote error
      processNote.mockRejectedValueOnce(new Error('Processing error'));

      // Execute
      await noteController.createNote(mockReq, mockRes);

      // Verify
      expect(processNote).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
}); 