import { DATA_TYPE_OBJECT_EXPECTED, MISSING_REQUIRED_PROPERTY, DATA_TYPE_STRING_EXPECTED } from '../../../../Commons/exceptions/consts/DomainErrorConsts'
import RegisteredUser, { type RegisteredUserPayload } from '../RegisteredUser'

describe('a RegisteredUser entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const noIdPayload: any = {
      username: 123,
      fullName: ['abc']
    }
    const noUsernamePayload: any = {
      id: '123',
      uname: '',
      fullname: 'user'
    }
    const noFullnamePayload: any = {
      id: '123',
      username: 'newuser'
    }

    // Action and Assert
    expect(() => new RegisteredUser(payload))
      .toThrowError(`RegisteredUser.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new RegisteredUser(noIdPayload))
      .toThrowError(`RegisteredUser.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new RegisteredUser(noUsernamePayload))
      .toThrowError(`RegisteredUser.${MISSING_REQUIRED_PROPERTY}."username`)
    expect(() => new RegisteredUser(noFullnamePayload))
      .toThrowError(`RegisteredUser.${MISSING_REQUIRED_PROPERTY}."fullname"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: RegisteredUserPayload = {
      id: false,
      username: 'abc',
      fullname: true
    } as any
    const payload2: RegisteredUserPayload = {
      id: 'abc',
      username: 123456,
      fullname: 'new user'
    } as any
    const payload3: RegisteredUserPayload = {
      id: 'usr-123',
      username: 'false',
      fullname: [456, 123]
    } as any

    // Action and Assert
    expect(() => new RegisteredUser(payload1))
      .toThrowError(`RegisteredUser.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new RegisteredUser(payload2))
      .toThrowError(`RegisteredUser.${DATA_TYPE_STRING_EXPECTED}."username"`)
    expect(() => new RegisteredUser(payload3))
      .toThrowError(`RegisteredUser.${DATA_TYPE_STRING_EXPECTED}."fullname"`)
  })

  it('should create RegisteredUser object correctly', () => {
    // Arrange
    const payload: RegisteredUserPayload = {
      id: 'user-123',
      username: 'dicoding',
      fullname: 'Dicoding Indonesia'
    }

    // Action
    const { id, username, fullname } = new RegisteredUser(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(username).toEqual(payload.username)
    expect(fullname).toEqual(payload.fullname)
  })
})
