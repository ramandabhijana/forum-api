import ThreadWithUsername, { type ThreadWithUsernamePayload } from '../ThreadWithUsername'
import { DATA_TYPE_DATE_EXPECTED, DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a ThreadWithUsername entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: Omit<ThreadWithUsernamePayload, 'id'> = {
      body: 'thread body',
      date: new Date(),
      title: 'thread title',
      username: 'username'
    }
    const payload3: Omit<ThreadWithUsernamePayload, 'title'> = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      date: new Date()
    }
    const payload4: Omit<ThreadWithUsernamePayload, 'body'> = {
      id: 'thread-123',
      username: 'username',
      title: 'thread title',
      date: new Date()
    }
    const payload5: Omit<ThreadWithUsernamePayload, 'date'> = {
      id: 'thread-123',
      username: 'username',
      title: 'thread title',
      body: 'thread body'
    }
    const payload6: Omit<ThreadWithUsernamePayload, 'username'> = {
      id: 'thread-123',
      date: new Date(),
      title: 'thread title',
      body: 'thread body'
    }

    // Action and Assert
    expect(() => new ThreadWithUsername(payload))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new ThreadWithUsername(payload1))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new ThreadWithUsername(payload2 as any))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new ThreadWithUsername(payload3 as any))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."title"`)
    expect(() => new ThreadWithUsername(payload4 as any))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."body"`)
    expect(() => new ThreadWithUsername(payload5 as any))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."date"`)
    expect(() => new ThreadWithUsername(payload6 as any))
      .toThrowError(`ThreadWithUsername.${MISSING_REQUIRED_PROPERTY}."username"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: ThreadWithUsernamePayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      date: new Date(),
      title: 'thread title'
    }
    const payload0: ThreadWithUsernamePayload = {
      ...payload,
      id: 1223
    } as any
    const payload1: ThreadWithUsernamePayload = {
      ...payload,
      username: ['username']
    } as any
    const payload2: ThreadWithUsernamePayload = {
      ...payload,
      body: false
    } as any
    const payload3: ThreadWithUsernamePayload = {
      ...payload,
      date: false
    } as any
    const payload4: ThreadWithUsernamePayload = {
      ...payload,
      title: 1024 * 5120000
    } as any

    // Action and Assert
    expect(() => new ThreadWithUsername(payload0))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new ThreadWithUsername(payload1))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_STRING_EXPECTED}."username"`)
    expect(() => new ThreadWithUsername(payload2))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_STRING_EXPECTED}."body"`)
    expect(() => new ThreadWithUsername(payload3))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_DATE_EXPECTED}."date"`)
    expect(() => new ThreadWithUsername(payload4))
      .toThrowError(`ThreadWithUsername.${DATA_TYPE_STRING_EXPECTED}."title"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: ThreadWithUsernamePayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      date: new Date(),
      title: 'thread title'
    }
    const payload1: ThreadWithUsernamePayload = {
      ...payload,
      username: ''
    }
    const payload2: ThreadWithUsernamePayload = {
      ...payload,
      body: ''
    }
    const payload3: ThreadWithUsernamePayload = {
      ...payload,
      title: ''
    }
    const payload4: ThreadWithUsernamePayload = {
      ...payload,
      id: ''
    }

    // Action and Assert
    expect(() => new ThreadWithUsername(payload1))
      .toThrowError(`ThreadWithUsername.${STRING_EMPTY}."username"`)
    expect(() => new ThreadWithUsername(payload2))
      .toThrowError(`ThreadWithUsername.${STRING_EMPTY}."body"`)
    expect(() => new ThreadWithUsername(payload3))
      .toThrowError(`ThreadWithUsername.${STRING_EMPTY}."title"`)
    expect(() => new ThreadWithUsername(payload4))
      .toThrowError(`ThreadWithUsername.${STRING_EMPTY}."id"`)
  })

  it('should create a ThreadWithUsername object correctly', () => {
    // Arrange
    const payload: ThreadWithUsernamePayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      date: new Date(),
      title: 'thread title'
    }

    // Action
    const { id, title, body, date, username } = new ThreadWithUsername(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(title).toEqual(payload.title)
    expect(body).toEqual(payload.body)
    expect(date).toEqual(payload.date)
    expect(username).toEqual(payload.username)
  })
})
