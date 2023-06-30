import CryptoManager from '../CryptoManager'
import { Config } from '../../../Commons/config/server-config'
import { type AES } from 'crypto-js'

describe('CryptoManager', () => {
  describe('encrypt function', () => {
    it('should encrypt plain string data properly', () => {
      // Arrange
      const plain = 'a plain text'
      const mockCipher: typeof AES = {
        encrypt: jest.fn().mockImplementation(() => 'encrypted_string'),
        decrypt: jest.fn().mockImplementation(() => '')
      }
      const cryptManager = new CryptoManager(mockCipher)

      // Action
      const encrypted = cryptManager.encrypt(plain)

      // Assert
      expect(mockCipher.encrypt).toBeCalledWith(plain, Config.instance.cryptKey)
      expect(encrypted).toEqual('encrypted_string')
    })
  })

  describe('decrypt function', () => {
    // Arrange
    const encryptedString = '5tr1nG'
    const mockCipher: typeof AES = {
      encrypt: jest.fn().mockImplementation(() => null),
      decrypt: jest.fn().mockImplementation(() => 'test')
    }
    const cryptManager = new CryptoManager(mockCipher)

    // Action
    const plain = cryptManager.decrypt(encryptedString)

    // Assert
    expect(mockCipher.decrypt).toBeCalledWith(encryptedString, Config.instance.cryptKey)
    expect(plain).toEqual('test')
  })
})
