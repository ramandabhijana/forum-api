import DetailedThread, { type DetailedThreadPayload, MAX_COMMENTS_COUNT } from '../DetailedThread'
import { DATA_TYPE_ARRAY_EXPECTED, DATA_TYPE_DATE_EXPECTED, DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_ITEM, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a DetailedThread entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: Omit<DetailedThreadPayload, 'id'> = {
      username: 'username',
      body: 'thread body',
      comments: [],
      date: new Date(),
      title: 'thread title'
    }
    const payload3: Omit<DetailedThreadPayload, 'title'> = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: [],
      date: new Date()
    }
    const payload4: Omit<DetailedThreadPayload, 'body'> = {
      id: 'thread-123',
      username: 'username',
      title: 'thread title',
      comments: [],
      date: new Date()
    }
    const payload5: Omit<DetailedThreadPayload, 'date'> = {
      id: 'thread-123',
      username: 'username',
      title: 'thread title',
      comments: [],
      body: 'thread body'
    }
    const payload6: Omit<DetailedThreadPayload, 'username'> = {
      id: 'thread-123',
      date: new Date(),
      title: 'thread title',
      comments: [],
      body: 'thread body'
    }
    const payload7: Omit<DetailedThreadPayload, 'comments'> = {
      id: 'thread-123',
      date: new Date(),
      title: 'thread title',
      username: 'username',
      body: 'thread body'
    }

    // Action and Assert
    expect(() => new DetailedThread(payload))
      .toThrowError(`DetailedThread.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new DetailedThread(payload1))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new DetailedThread(payload2 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new DetailedThread(payload3 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."title"`)
    expect(() => new DetailedThread(payload4 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."body"`)
    expect(() => new DetailedThread(payload5 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."date"`)
    expect(() => new DetailedThread(payload6 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."username"`)
    expect(() => new DetailedThread(payload7 as any))
      .toThrowError(`DetailedThread.${MISSING_REQUIRED_PROPERTY}."comments"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: DetailedThreadPayload = {
      id: 123,
      username: 'username',
      body: 'thread body',
      comments: [],
      date: new Date(),
      title: 'thread title'
    } as any
    const payload1: DetailedThreadPayload = {
      id: 'thread-123',
      username: ['username'],
      body: 'thread body',
      comments: [],
      date: new Date(),
      title: 'thread title'
    } as any
    const payload2: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: false,
      comments: [],
      date: new Date(),
      title: 'thread title'
    } as any
    const payload3: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: [],
      date: false,
      title: 'thread title'
    } as any
    const payload4: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: [],
      date: new Date(),
      title: 1024 * 5120000
    } as any
    const payload5: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: 'a comment',
      date: new Date(),
      title: 'thread title'
    } as any

    // Action and Assert
    expect(() => new DetailedThread(payload))
      .toThrowError(`DetailedThread.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new DetailedThread(payload1))
      .toThrowError(`DetailedThread.${DATA_TYPE_STRING_EXPECTED}."username"`)
    expect(() => new DetailedThread(payload2))
      .toThrowError(`DetailedThread.${DATA_TYPE_STRING_EXPECTED}."body"`)
    expect(() => new DetailedThread(payload3))
      .toThrowError(`DetailedThread.${DATA_TYPE_DATE_EXPECTED}."date"`)
    expect(() => new DetailedThread(payload4))
      .toThrowError(`DetailedThread.${DATA_TYPE_STRING_EXPECTED}."title"`)
    expect(() => new DetailedThread(payload5))
      .toThrowError(`DetailedThread.${DATA_TYPE_ARRAY_EXPECTED}."comments"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: [],
      date: new Date(),
      title: 'thread title'
    }
    const payload1: DetailedThreadPayload = {
      ...payload,
      username: ''
    }
    const payload2: DetailedThreadPayload = {
      ...payload,
      body: ''
    }
    const payload3: DetailedThreadPayload = {
      ...payload,
      title: ''
    }
    const payload4: DetailedThreadPayload = {
      ...payload,
      id: ''
    }

    // Action and Assert
    expect(() => new DetailedThread(payload1))
      .toThrowError(`DetailedThread.${STRING_EMPTY}."username"`)
    expect(() => new DetailedThread(payload2))
      .toThrowError(`DetailedThread.${STRING_EMPTY}."body"`)
    expect(() => new DetailedThread(payload3))
      .toThrowError(`DetailedThread.${STRING_EMPTY}."title"`)
    expect(() => new DetailedThread(payload4))
      .toThrowError(`DetailedThread.${STRING_EMPTY}."id"`)
  })

  it("should throw an error when comments array's length exceed the limit", () => {
    // Arrange
    const payload: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: Array.from({ length: MAX_COMMENTS_COUNT + 1 }, () => ({
        id: 'comment-123',
        username: 'username',
        date: new Date(),
        content: 'a comment',
        replies: []
      })),
      date: new Date(),
      title: 'thread title'
    }

    // Action and Assert
    expect(() => new DetailedThread(payload))
      .toThrowError(`DetailedThread.${MAX_LIMIT_ITEM}."comments"`)
  })

  it('should create a DetailedThread object correctly', () => {
    // Arrange
    const payload: DetailedThreadPayload = {
      id: 'thread-123',
      username: 'username',
      body: 'thread body',
      comments: [
        {
          id: 'comment-123',
          username: 'username',
          date: new Date(),
          content: 'a comment',
          replies: []
        }
      ],
      date: new Date(),
      title: 'thread title'
    }

    // Action
    const { id, title, body, date, username, comments } = new DetailedThread(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(title).toEqual(payload.title)
    expect(body).toEqual(payload.body)
    expect(date).toEqual(payload.date)
    expect(username).toEqual(payload.username)
    expect(comments).toEqual(payload.comments)
  })
})
