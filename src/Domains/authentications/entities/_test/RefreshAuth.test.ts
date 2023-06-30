import RefreshAuth, { type RefreshAuthPayload } from '../RefreshAuth'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('an RefreshAuth entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}

    // Action and Assert
    expect(() => new RefreshAuth(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new RefreshAuth(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "refreshToken")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: RefreshAuthPayload = {
      refreshToken: new Date()
    } as any

    // Action and Assert
    expect(() => new RefreshAuth(payload))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "refreshToken")`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: RefreshAuthPayload = {
      refreshToken: ''
    }

    // Action and Assert
    expect(() => new RefreshAuth(payload))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "refreshToken")`)
  })

  it('should create a RefreshAuth object correctly', () => {
    // Arrange
    const payload: RefreshAuthPayload = {
      refreshToken: 'REFRESH_TOKEN'
    }

    // Action
    const { refreshToken } = new RefreshAuth(payload).asObject

    // Assert
    expect(refreshToken).toEqual(payload.refreshToken)
  })
})
