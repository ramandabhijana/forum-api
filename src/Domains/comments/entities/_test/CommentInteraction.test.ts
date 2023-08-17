import CommentInteraction, { type CommentInteractionPayload } from '../CommentInteraction'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a CommentInteraction entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { userId: 'user-123', commentId: 'comment-123' }
    const payload3: any = { commentId: 'comment-123', threadId: 'thread-123' }
    const payload4: any = { userId: 'user-123', threadId: 'thread-123' }

    // Action and Assert
    expect(() => new CommentInteraction(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new CommentInteraction(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new CommentInteraction(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new CommentInteraction(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "userId")`)
    expect(() => new CommentInteraction(payload4))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "commentId")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: CommentInteractionPayload = {
      commentId: false,
      threadId: 'thread-123',
      userId: 'user-123'
    } as any
    const payload1: CommentInteractionPayload = {
      commentId: 'comment-123',
      threadId: 12344,
      userId: 'user-123'
    } as any
    const payload2: CommentInteractionPayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: new Date()
    } as any

    // Action and Assert
    expect(() => new CommentInteraction(payload))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "commentId")`)
    expect(() => new CommentInteraction(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "threadId")`)
    expect(() => new CommentInteraction(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "userId")`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: CommentInteractionPayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123'
    }
    const payload1: CommentInteractionPayload = {
      ...payload,
      threadId: ''
    }
    const payload2: CommentInteractionPayload = {
      ...payload,
      commentId: ''
    }
    const payload3: CommentInteractionPayload = {
      ...payload,
      userId: ''
    }

    // Action and Assert
    expect(() => new CommentInteraction(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "threadId")`)
    expect(() => new CommentInteraction(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "commentId")`)
    expect(() => new CommentInteraction(payload3))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "userId")`)
  })

  it('should create a CommentInteraction object correctly', () => {
    // Arrange
    const payload: CommentInteractionPayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123'
    }

    // Action
    const { commentId, threadId, userId } = new CommentInteraction(payload)

    // Assert
    expect(commentId).toEqual(payload.commentId)
    expect(threadId).toEqual(payload.threadId)
    expect(userId).toEqual(payload.userId)
  })
})
