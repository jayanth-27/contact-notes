const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../models/db');

// Mock the database module
jest.mock('../../models/db', () => ({
  query: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const authController = require('../../controllers/authController');

describe('Auth Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock database responses
      db.query
        .mockResolvedValueOnce({ rows: [] }) // User doesn't exist
        .mockResolvedValueOnce({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com' }] }); // New user

      // Mock bcrypt hash
      bcrypt.hash.mockResolvedValue('hashedPassword');

      // Mock jwt sign
      jwt.sign.mockReturnValue('mockToken');

      // Execute
      await authController.register(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1 },
        'test-secret',
        { expiresIn: '1d' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
          token: 'mockToken',
        },
      });
    });

    it('should return error if user already exists', async () => {
      // Setup
      mockReq.body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock database response - user exists
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      // Execute
      await authController.register(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User with that email or username already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Setup
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock database response
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword',
        }],
      });

      // Mock bcrypt compare
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt sign
      jwt.sign.mockReturnValue('mockToken');

      // Execute
      await authController.login(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1 },
        'test-secret',
        { expiresIn: '1d' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
          token: 'mockToken',
        },
      });
    });

    it('should return error for invalid credentials', async () => {
      // Setup
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock database response
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedPassword',
        }],
      });

      // Mock bcrypt compare
      bcrypt.compare.mockResolvedValue(false);

      // Execute
      await authController.login(mockReq, mockRes);

      // Verify
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });
}); 