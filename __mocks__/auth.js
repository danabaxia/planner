// Mock for auth module
module.exports = {
  authOptions: {
    providers: [],
    callbacks: {},
  },
  getServerSession: jest.fn(),
  refreshAccessToken: jest.fn(),
}; 