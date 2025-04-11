const db = require('../../models/db');
const processNote = require('../../workers/noteProcessor');

// Mock the database module
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

describe('Note Processor', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should process a note successfully', async () => {
    // Setup mock note data
    const mockNote = {
      id: 123,
      contact_id: 456,
      user_id: 789,
      body: 'This is a test note that needs processing',
      created_at: new Date().toISOString()
    };

    // Mock database response
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    // Execute
    const result = await processNote(mockNote);

    // Verify
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE notes SET status = $1 WHERE id = $2',
      ['processed', 123]
    );
    expect(result).toEqual({
      success: true,
      noteId: 123,
      message: 'Note processed successfully'
    });
  });

  it('should handle errors during processing', async () => {
    // Setup mock note data
    const mockNote = {
      id: 123,
      contact_id: 456,
      user_id: 789,
      body: 'This is a test note that will fail processing',
      created_at: new Date().toISOString()
    };

    // Mock database error
    const dbError = new Error('Database error');
    db.query.mockRejectedValueOnce(dbError);

    // Execute and verify
    await expect(processNote(mockNote)).rejects.toThrow(dbError);
    expect(db.query).toHaveBeenCalledWith(
      'UPDATE notes SET status = $1 WHERE id = $2',
      ['processed', 123]
    );
  });
}); 