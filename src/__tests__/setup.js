// Set environment to test
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1d';
process.env.DB_USER = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'contact_notes_test';
process.env.DB_PASSWORD = 'test';
process.env.DB_PORT = '5432';

// Mock console methods to keep test output clean
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn(); 