import PasswordHash from '../../Applications/security/PasswordHash'
import type bcrypt from 'bcrypt'
import AuthenticationError from '../../Commons/exceptions/AuthenticationError'
import { PASSWORD_DID_NOT_MATCH } from '../../Commons/exceptions/messages/ErrorMessages'

class BcryptPasswordHash extends PasswordHash {
  constructor(
    private readonly _bcrypt: typeof bcrypt,
    private readonly saltRound: number = 10
  ) {
    super()
  }

  async hash(password: string): Promise<string> {
    const hashed = await this._bcrypt.hash(password, this.saltRound)
    return hashed
  }

  async compare(plain: string, encrypted: string): Promise<void> {
    const isMatched = await this._bcrypt.compare(plain, encrypted)
    if (!isMatched) {
      throw new AuthenticationError(PASSWORD_DID_NOT_MATCH)
    }
  }
}

export default BcryptPasswordHash
