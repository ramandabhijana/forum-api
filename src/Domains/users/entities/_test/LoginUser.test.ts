import LoginUser, { type LoginUserPayload } from '../LoginUser'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MIN_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'

describe('a LoginUser entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { username: 'usr123' }
    const payload3: any = { password: 'secret' }

    // Action and Assert
    expect(() => new LoginUser(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new LoginUser(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "username")`)
    expect(() => new LoginUser(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "password")`)
    expect(() => new LoginUser(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "username")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: LoginUserPayload = {
      username: 123,
      password: 'secret'
    } as any
    const payload2: LoginUserPayload = {
      username: 'usr123',
      password: [123, 456]
    } as any

    // Action and Assert
    expect(() => new LoginUser(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "username")`)
    expect(() => new LoginUser(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "password")`)
  })

  it('should throw an error when the number of characters for username is more than 50 characters or less than 1', () => {
    // Arrange
    const payload1: LoginUserPayload = {
      username: 'abhijanaabhijanaabhijanaabhijanaabhijanaabhijanaabhijana',
      password: 'secret'
    }
    const payload2: LoginUserPayload = {
      username: '',
      password: '[123, 456]'
    }

    // Action and Asseert
    expect(() => new LoginUser(payload1))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "username")`)
    expect(() => new LoginUser(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "username")`)
  })

  it('should throw an error when the number of characters for password is less than 3', () => {
    // Arrange
    const payload: LoginUserPayload = {
      username: 'abhijana',
      password: 'pw'
    }
    const payload1: LoginUserPayload = {
      username: 'abhijana',
      password: ''
    }

    // Action and Asseert
    expect(() => new LoginUser(payload))
      .toThrowError(`${errorMap.get(MIN_LIMIT_CHAR) as string}. (property: "password")`)
    expect(() => new LoginUser(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "password")`)
  })

  it('should create a LoginUser object correctly', () => {
    // Arrange
    const payload: LoginUserPayload = {
      username: 'abhijana',
      password: '123'
    }

    // Action
    const { username, password } = new LoginUser(payload)

    // Assert
    expect(username).toEqual(payload.username)
    expect(password).toEqual(payload.password)
  })
})
