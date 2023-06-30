import NewAuth, { type NewAuthPayload } from '../NewAuth'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('an NewAuth entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {
      accessToken: 'ACCESS_TOKEN'
    }
    const payload2: any = {
      refreshToken: 'REFRESH_TOKEN'
    }

    // Action and Assert
    expect(() => new NewAuth(payload))
      .toThrowError(`NewAuth.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new NewAuth(payload1))
      .toThrowError(`NewAuth.${MISSING_REQUIRED_PROPERTY}."refreshToken"`)
    expect(() => new NewAuth(payload2))
      .toThrowError(`NewAuth.${MISSING_REQUIRED_PROPERTY}."accessToken"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: NewAuthPayload = {
      accessToken: 123456,
      refreshToken: 'REFRESH_TOKEN'
    } as any
    const payload2: NewAuthPayload = {
      accessToken: 'ACCESS_TOKEN',
      refreshToken: 123456
    } as any

    // Action and Assert
    expect(() => new NewAuth(payload1))
      .toThrowError(`NewAuth.${DATA_TYPE_STRING_EXPECTED}."accessToken"`)
    expect(() => new NewAuth(payload2))
      .toThrowError(`NewAuth.${DATA_TYPE_STRING_EXPECTED}."refreshToken"`)
  })

  it('should create a NewAuth object correctly', () => {
    // Arrange
    const payload: NewAuthPayload = {
      accessToken: 'ACCESS_TOKEN',
      refreshToken: 'REFRESH_TOKEN'
    }

    // Action
    const { accessToken, refreshToken } = new NewAuth(payload)

    // Assert
    expect(accessToken).toEqual(payload.accessToken)
    expect(refreshToken).toEqual(payload.refreshToken)
  })
})
