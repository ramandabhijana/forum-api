abstract class PasswordHash {
  abstract hash(password: string): Promise<string>
  abstract compare(plain: string, encrypted: string): Promise<void>
}

export default PasswordHash
