// Mock for next-auth main module
module.exports = {
  default: jest.fn(),
  getServerSession: jest.fn(),
  NextAuth: jest.fn(),
  AuthOptions: {},
}; 