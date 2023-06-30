import NewThread, { type NewThreadPayload } from '../NewThread'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a NewThread entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { title: 'thread title' }
    const payload3: any = { body: 'secret' }
    const payload4: any = {
      title: 'title',
      body: 'secret'
    }

    // Action and Assert
    expect(() => new NewThread(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new NewThread(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "title")`)
    expect(() => new NewThread(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "body")`)
    expect(() => new NewThread(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "title")`)
    expect(() => new NewThread(payload4))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "userId")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: NewThreadPayload = {
      title: 123456,
      body: 'This is the body of the thread',
      userId: 'user-123'
    } as any
    const payload2: NewThreadPayload = {
      title: 'The title',
      body: false,
      userId: 'user-123'
    } as any
    const payload3: NewThreadPayload = {
      title: 'The title',
      body: 'A body',
      userId: ['user-123']
    } as any

    // Action and Assert
    expect(() => new NewThread(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "title")`)
    expect(() => new NewThread(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "body")`)
    expect(() => new NewThread(payload3))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "userId")`)
  })

  it('should throw an error when the number of characters for title is more than 100 characters or less than 1', () => {
    // Arrange
    const payload1: NewThreadPayload = {
      title: 'titletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitle',
      body: 'body',
      userId: 'user-123'
    }
    const payload2 = {
      title: '',
      body: 'body',
      userId: 'user-123'
    }

    // Action and Asseert
    expect(() => new NewThread(payload1))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "title")`)
    expect(() => new NewThread(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "title")`)
  })

  it('should throw an error when the number of characters for body is more than 255 characters or less than 1', () => {
    // Arrange
    const payload1: NewThreadPayload = {
      title: 'title',
      body: 'body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body ',
      userId: 'user-123'
    }
    const payload2: NewThreadPayload = {
      title: 'title',
      body: '',
      userId: 'user-123'
    }

    // Action and Asseert
    expect(() => new NewThread(payload1))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "body")`)
    expect(() => new NewThread(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "body")`)
  })

  it('should create a NewThread object correctly', () => {
    // Arrange
    const payload: NewThreadPayload = {
      title: "Thread's title",
      body: "Thread's body",
      userId: 'user-123'
    }

    // Action
    const { title, body, userId } = new NewThread(payload)

    // Assert
    expect(title).toEqual(payload.title)
    expect(body).toEqual(payload.body)
    expect(userId).toEqual(payload.userId)
  })
})
