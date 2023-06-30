import RegisterUser, { type RegisterUserPayload } from '../RegisterUser'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MIN_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY, USERNAME_CONTAIN_RESTRICTED_CHARACTER } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a RegisterUser entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const noUsernamePayload: any = {
      uname: '',
      password: 'abc',
      fullname: true
    }
    const noPasswordPayload: any = {
      username: 'abc',
      fullname: 123,
      pwd: ''
    }
    const noFullnamePayload: any = {
      username: 'abc',
      password: '123',
      fullName: ''
    }

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new RegisterUser(noUsernamePayload))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "username")`)
    expect(() => new RegisterUser(noPasswordPayload))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "password")`)
    expect(() => new RegisterUser(noFullnamePayload))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "fullname")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: RegisterUserPayload = {
      username: 123,
      password: 'abc',
      fullname: true
    } as any
    const payload2: RegisterUserPayload = {
      username: 'a',
      password: false,
      fullname: [false]
    } as any
    const payload3: RegisterUserPayload = {
      username: 'a',
      password: 'false',
      fullname: 456
    } as any

    // Action and Assert
    expect(() => new RegisterUser(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "username")`)
    expect(() => new RegisterUser(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "password")`)
    expect(() => new RegisterUser(payload3))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "fullname")`)
  })

  it('should throw an error when the number of characters for username is more than 50 characters or less than 1', () => {
    // Arrange
    const payload: RegisterUserPayload = {
      username: 'abhijanaabhijanaabhijanaabhijanaabhijanaabhijanaabhijana',
      fullname: 'Abhijana',
      password: 'abc'
    }
    const payload2: RegisterUserPayload = {
      username: '',
      fullname: 'Abhijana',
      password: 'abc'
    }

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "username")`)
    expect(() => new RegisterUser(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "username")`)
  })

  it('should throw an error when the number of characters for password is less than 3', () => {
    // Arrange
    const payload: RegisterUserPayload = {
      username: 'username',
      fullname: 'name',
      password: 'ps'
    }
    const payload1: RegisterUserPayload = {
      username: 'username',
      fullname: 'name',
      password: ''
    }

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError(`${errorMap.get(MIN_LIMIT_CHAR) as string}. (property: "password")`)
    expect(() => new RegisterUser(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "password")`)
  })

  it('should throw an error when the number of characters for fullname is more than 255 characters or less than 1', () => {
    // Arrange
    const payload: RegisterUserPayload = {
      username: 'username',
      fullname: '',
      password: 'password'
    }
    const payload1: RegisterUserPayload = {
      username: 'username',
      fullname: 'user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user user ',
      password: 'fullname'
    }

    // Action and Assert
    expect(() => new RegisterUser(payload1))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "fullname")`)
    expect(() => new RegisterUser(payload))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "fullname")`)
  })

  it('should throw an error when username contains restricted character', () => {
    // Arrange
    const payload = {
      username: 'user name',
      fullname: 'name',
      password: 'abc'
    }

    // Action and Assert
    expect(() => new RegisterUser(payload))
      .toThrowError(errorMap.get(USERNAME_CONTAIN_RESTRICTED_CHARACTER))
  })

  it('should create RegisterUser object correctly', () => {
    // Arrange
    const payload: RegisterUserPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'abc'
    }

    // Action
    const { username, fullname, password } = new RegisterUser(payload)

    // Assert
    expect(username).toEqual(payload.username)
    expect(fullname).toEqual(payload.fullname)
    expect(password).toEqual(payload.password)
  })

  it('should set password correctly', () => {
    // Arrange
    const payload: RegisterUserPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'abc'
    }
    const hashedPasswrod = '$2b$10$r9ziJZUfsVOQuMDbJU56HOgpiDyiBZZ82nefJlUwdcW8h0dyBiY0.'
    const registerUser = new RegisterUser(payload)

    // Action
    registerUser.password = hashedPasswrod

    // Assert
    expect(registerUser.password).toEqual(hashedPasswrod)
  })
})
