// Mock for jose module
module.exports = {
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(),
  importSPKI: jest.fn(),
  importPKCS8: jest.fn(),
  importJWK: jest.fn(),
  importX509: jest.fn(),
  createLocalJWKSet: jest.fn(),
  createRemoteJWKSet: jest.fn(),
  errors: {
    JOSEError: class JOSEError extends Error {},
    JWTClaimValidationFailed: class JWTClaimValidationFailed extends Error {},
    JWTExpired: class JWTExpired extends Error {},
    JWTInvalid: class JWTInvalid extends Error {},
    JWSInvalid: class JWSInvalid extends Error {},
    JWEInvalid: class JWEInvalid extends Error {},
  }
} 