import { DomainErrorTranslator } from '../DomainErrorTranslator'
import InvariantError from '../InvariantError'

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    // Arrange
    const translator = DomainErrorTranslator.instance
    const entityName = 'DomainEntity'
    const label = 'id'

    for (const entry of translator.dictionary.entries()) {
      const error = new Error(`${entityName}.${entry[0]}.${label}`)

      // Action
      const clientError = translator.translate(error)

      // Assert
      expect(clientError).toStrictEqual(new InvariantError(`${entry[1]}. (property: ${label})`))
    }
  })

  it('should throw error when error key does not exist in dictionary', () => {
    // Arrange
    const translator = DomainErrorTranslator.instance
    const error = new Error('DomainEntity.FILE_CORRUPTED.file')

    // Action & Assert
    expect(() => translator.translate(error)).toThrowError(new Error('Unable to translate domain error'))
  })
})
