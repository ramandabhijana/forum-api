import AddedComment, { type AddedCommentPayload } from '../AddedComment'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('an AddedComment entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = {
      id: 'comment-123',
      owner: 'user-8912'
    }
    const payload3: any = {
      id: 'comment-123',
      content: 'a comment'
    }
    const payload4: any = {
      content: 'a comment',
      owner: 'user-8912'
    }

    // Action and Assert
    expect(() => new AddedComment(payload))
      .toThrowError(`AddedComment.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new AddedComment(payload1))
      .toThrowError(`AddedComment.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new AddedComment(payload2))
      .toThrowError(`AddedComment.${MISSING_REQUIRED_PROPERTY}."content"`)
    expect(() => new AddedComment(payload3))
      .toThrowError(`AddedComment.${MISSING_REQUIRED_PROPERTY}."owner"`)
    expect(() => new AddedComment(payload4))
      .toThrowError(`AddedComment.${MISSING_REQUIRED_PROPERTY}."id"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: AddedCommentPayload = {
      id: 123456,
      content: 'a comment',
      owner: 'user-123'
    } as any
    const payload2: AddedCommentPayload = {
      id: 'comment-123456',
      content: false,
      owner: 'user-123'
    } as any
    const payload3: AddedCommentPayload = {
      id: 'comment-123456',
      content: 'false',
      owner: [121212]
    } as any

    // Action and Assert
    expect(() => new AddedComment(payload1))
      .toThrowError(`AddedComment.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new AddedComment(payload2))
      .toThrowError(`AddedComment.${DATA_TYPE_STRING_EXPECTED}."content"`)
    expect(() => new AddedComment(payload3))
      .toThrowError(`AddedComment.${DATA_TYPE_STRING_EXPECTED}."owner"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload1: AddedCommentPayload = {
      id: '',
      content: 'a comment',
      owner: 'user-123'
    }
    const payload2: AddedCommentPayload = {
      id: 'comment-123456',
      content: '',
      owner: 'user-123'
    }
    const payload3: AddedCommentPayload = {
      id: 'comment-123456',
      content: 'false',
      owner: ''
    }

    // Action and Assert
    expect(() => new AddedComment(payload1))
      .toThrowError(`AddedComment.${STRING_EMPTY}."id"`)
    expect(() => new AddedComment(payload2))
      .toThrowError(`AddedComment.${STRING_EMPTY}."content"`)
    expect(() => new AddedComment(payload3))
      .toThrowError(`AddedComment.${STRING_EMPTY}."owner"`)
  })

  it('should create an AddedComment object correctly', () => {
    // Arrange
    const payload: AddedCommentPayload = {
      id: 'comment-123456',
      content: 'A comment',
      owner: 'user-123'
    }

    // Action
    const addedComment = new AddedComment(payload)
    const { id, content, owner } = addedComment.asObject

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(payload.content)
    expect(owner).toEqual(payload.owner)
  })
})
