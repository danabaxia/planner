// Mock for next-auth/react
export const signIn = jest.fn().mockImplementation((provider, options) => {
  // Mock successful sign-in by default
  return Promise.resolve({
    error: null,
    status: 200,
    ok: true,
    url: 'http://localhost:3000/api/auth/callback/notion'
  })
})

export const signOut = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    url: 'http://localhost:3000'
  })
})

export const useSession = jest.fn().mockImplementation(() => ({
  data: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    },
    accessToken: 'mock-access-token'
  },
  status: 'authenticated'
}))

export const SessionProvider = ({ children }) => children

export const getSession = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    },
    accessToken: 'mock-access-token'
  })
})

export const getCsrfToken = jest.fn().mockImplementation(() => {
  return Promise.resolve('mock-csrf-token')
})

export const getProviders = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    notion: {
      id: 'notion',
      name: 'Notion',
      type: 'oauth',
      signinUrl: 'http://localhost:3000/api/auth/signin/notion',
      callbackUrl: 'http://localhost:3000/api/auth/callback/notion'
    }
  })
}) 