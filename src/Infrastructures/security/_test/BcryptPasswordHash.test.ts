import bcrypt from 'bcrypt'
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError'
import BcryptPasswordHash from '../BcryptPasswordHash'

describe('BcryptPasswordHash', () => {
  describe('hash function', () => {
    it('should encrypt password correctly', async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, 'hash')
      const saltRound = 15
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt, saltRound)

      // Action
      const encryptedPassword = await bcryptPasswordHash.hash('plain_password')

      // Assert
      expect(typeof encryptedPassword).toEqual('string')
      expect(encryptedPassword).not.toEqual('plain_password')
      expect(spyHash).toBeCalledWith('plain_password', saltRound)
    }, 10_000)
  })

  describe('comparePassword function', () => {
    it('should throw an AuthenticationError when provided passwords do not match', async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, 'compare')
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt)

      // Action & Assert
      await expect(bcryptPasswordHash.compare('plain', 'encrypted')).rejects.toThrowError(AuthenticationError)
      expect(spyHash).toBeCalledWith('plain', 'encrypted')
    })

    it('should not throw an AuthenticationError when provided passwords match', async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, 'compare')
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt)
      const plainPassword = 'plain_password'
      const encryptedPassword = await bcryptPasswordHash.hash(plainPassword)

      // Action & Assert
      await expect(bcryptPasswordHash.compare(plainPassword, encryptedPassword)).resolves.not.toThrowError(AuthenticationError)
      expect(spyHash).toBeCalledWith(plainPassword, encryptedPassword)
    }, 10_000)
  })
})
