import type ClientError from './ClientError'
import InvariantError from './InvariantError'
import { DATA_TYPE_ARRAY_EXPECTED, DATA_TYPE_DATE_EXPECTED, DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, ITEM_DATA_TYPE_MISMATCHED, MAX_LIMIT_CHAR, MAX_LIMIT_ITEM, MIN_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY, USERNAME_CONTAIN_RESTRICTED_CHARACTER } from './consts/DomainErrorConsts'

export class DomainErrorTranslator {
  readonly dictionary = new Map<string, string>([
    [DATA_TYPE_STRING_EXPECTED, 'Tipe data "string" diperlukan'],
    [MAX_LIMIT_CHAR, 'Jumlah karakter melebihi batas ditentukan'],
    [MIN_LIMIT_CHAR, 'Jumlah karakter kurang dari batas ditentukan'],
    [DATA_TYPE_DATE_EXPECTED, 'Tipe data "date" diperlukan'],
    [DATA_TYPE_ARRAY_EXPECTED, 'Tipe data "array" diperlukan'],
    [MAX_LIMIT_ITEM, 'Jumlah elemen dalam array melebihi batas ditentukan'],
    [ITEM_DATA_TYPE_MISMATCHED, 'Tipe data dari elemen dalam array tidak sesuai'],
    [DATA_TYPE_OBJECT_EXPECTED, 'Tipe data harus berupa "object"'],
    [MISSING_REQUIRED_PROPERTY, 'Properti wajib tidak tercantum'],
    [STRING_EMPTY, 'Properti dengan tipe data "string" wajib berisi setidaknya sebuah karakter'],
    [USERNAME_CONTAIN_RESTRICTED_CHARACTER, 'tidak dapat membuat user baru karena username mengandung karakter terlarang'] // special case
  ])

  private static _instance?: DomainErrorTranslator

  static get instance(): DomainErrorTranslator {
    if (DomainErrorTranslator._instance === undefined) {
      DomainErrorTranslator._instance = new DomainErrorTranslator()
    }
    return DomainErrorTranslator._instance
  }

  translate(error: Error): ClientError {
    const [, name, label] = error.message.split('.')
    const errorMessage = this.dictionary.get(name)
    if (errorMessage === undefined) throw Error('Unable to translate domain error')
    const property = label === undefined ? '' : `. (property: ${label})`

    return new InvariantError(`${errorMessage}${property}`)
  }
}
