const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
  ],
  // Handle ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  // Transform ES modules
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client|oauth4webapi|@panva|preact-render-to-string|@auth|next-auth|@prisma)/)'
  ],
  // Module mapping and mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose$': '<rootDir>/__mocks__/jose.js',
    '^openid-client$': '<rootDir>/__mocks__/openid-client.js',
    '^next-auth$': '<rootDir>/__mocks__/next-auth/index.js',
    '^next-auth/react$': '<rootDir>/__mocks__/next-auth/react.js',
    '^@/lib/auth$': '<rootDir>/__mocks__/auth.js',
    '^@auth/prisma-adapter$': '<rootDir>/__mocks__/@auth/prisma-adapter.js'
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
