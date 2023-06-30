import JwTokenManager from '../JwTokenManager'
import { token } from '@hapi/jwt'
import InvariantError from '../../../Commons/exceptions/InvariantError'
import { Config } from '../../../Commons/config/server-config'

describe('JwTokenManager', () => {
  function mockCryptManager(): any {
    const cryptManager: any = {}
    cryptManager.encrypt = jest.fn()
      .mockImplementation(() => { 'encrypted' })
    cryptManager.decrypt = jest.fn()
      .mockImplementation(() => { 'decrypted' })
    return cryptManager
  }

  describe('createRefreshToken function', () => {
    it('should create refresh token properly', () => {
      // Arrange
      const payload = {
        id: 'user-123'
      }
      const mockJwt: any = {
        generate: jest.fn().mockImplementation(() => 'mock_token')
      }
      const cryptManager = mockCryptManager()
      const encryptedId = cryptManager.encrypt(payload.id)

      const tokenManager = new JwTokenManager(
        mockJwt as typeof token,
        cryptManager
      )

      // Action
      const refreshToken = tokenManager.createRefreshToken(payload)

      // Assert
      expect(mockJwt.generate).toBeCalledWith({ id: encryptedId }, Config.instance.refreshTokenKey)
      expect(refreshToken).toEqual('mock_token')
    })
  })

  describe('createAccessToken function', () => {
    it('should create access token properly', () => {
      // Arrange
      const payload = {
        id: 'user-123'
      }
      const mockJwt: any = {
        generate: jest.fn().mockImplementation(() => 'mock_token')
      }
      const cryptManager = mockCryptManager()
      const encryptedId = cryptManager.encrypt(payload.id)
      const tokenManager = new JwTokenManager(
        mockJwt as typeof token,
        cryptManager
      )

      // Action
      const accessToken = tokenManager.createAccessToken(payload)

      // Assert
      expect(mockJwt.generate)
        .toBeCalledWith({ id: encryptedId }, Config.instance.accessTokenKey)
      expect(accessToken).toEqual('mock_token')
    })
  })

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', () => {
      // Arrange
      const jwtTokenManager = new JwTokenManager(token, mockCryptManager())
      const accessToken = jwtTokenManager.createAccessToken({
        username: 'dicoding'
      } as any)

      // Action & Assert
      expect(() => { jwtTokenManager.verifyRefreshToken(accessToken) })
        .toThrow(InvariantError)
    })

    it('should not throw InvariantError when refresh token verified', () => {
      // Arrange
      const jwtTokenManager = new JwTokenManager(token, mockCryptManager())
      const refreshToken = jwtTokenManager.createRefreshToken({ id: '' })

      // Action & Assert
      expect(() => { jwtTokenManager.verifyRefreshToken(refreshToken) })
        .not.toThrow(InvariantError)
    })
  })

  describe('decodeRefreshToken function', () => {
    it('should decode token correctly', () => {
      // Arrange
      const id = 'user-123'
      const mockCryptManager: any = {
        decrypt: jest.fn().mockImplementation(() => id),
        encrypt: jest.fn().mockImplementation(() => '%3ncYpTD')
      }
      const jwtTokenManager = new JwTokenManager(token, mockCryptManager)
      const accessToken = jwtTokenManager.createAccessToken({ id })

      // Action
      const { id: expectedId } = jwtTokenManager.decodeRefreshToken(accessToken)

      // Action & Assert
      expect(expectedId).toEqual('user-123')
    })
  })
})
