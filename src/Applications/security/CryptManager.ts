abstract class CryptManager {
  abstract encrypt(data: string): string
  abstract decrypt(data: string): string
}

export default CryptManager
