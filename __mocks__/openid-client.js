// Mock for openid-client module
module.exports = {
  Issuer: {
    discover: jest.fn(),
  },
  Client: jest.fn(),
  generators: {
    codeVerifier: jest.fn(),
    codeChallenge: jest.fn(),
    state: jest.fn(),
    nonce: jest.fn(),
  },
  custom: {
    setHttpOptionsDefaults: jest.fn(),
  },
  errors: {
    OPError: class OPError extends Error {},
    RPError: class RPError extends Error {},
  }
} 