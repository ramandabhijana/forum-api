import Joi from 'joi'
import { DomainErrorTranslator } from '../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_ARRAY_EXPECTED, DATA_TYPE_DATE_EXPECTED, DATA_TYPE_NUMBER_EXPECTED, DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, ITEM_DATA_TYPE_MISMATCHED, MAX_LIMIT_CHAR, MAX_LIMIT_ITEM, MIN_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, NUMBER_TYPE_INTEGER_EXPECTED, STRING_EMPTY } from '../Commons/exceptions/consts/DomainErrorConsts'

abstract class DomainEntity<P> {
  constructor(protected readonly payload: P) {
    this.validatePayload(payload)
  }

  private get payloadSchema(): Joi.ObjectSchema {
    return Joi.object(this.schema).messages({
      'string.base': `${this.entityName}.${DATA_TYPE_STRING_EXPECTED}.{{#label}}`,
      'number.base': `${this.entityName}.${DATA_TYPE_NUMBER_EXPECTED}.{{#label}}`,
      'number.integer': `${this.entityName}.${NUMBER_TYPE_INTEGER_EXPECTED}.{{#label}}`,
      'string.max': `${this.entityName}.${MAX_LIMIT_CHAR}.{{#label}}`,
      'string.min': `${this.entityName}.${MIN_LIMIT_CHAR}.{{#label}}`,
      'string.empty': `${this.entityName}.${STRING_EMPTY}.{{#label}}`,
      'date.base': `${this.entityName}.${DATA_TYPE_DATE_EXPECTED}.{{#label}}`,
      'array.base': `${this.entityName}.${DATA_TYPE_ARRAY_EXPECTED}.{{#label}}`,
      'array.max': `${this.entityName}.${MAX_LIMIT_ITEM}.{{#label}}`,
      'array.includesRequiredUnknowns': `${this.entityName}.${ITEM_DATA_TYPE_MISMATCHED}.{{#label}}`,
      'object.base': `${this.entityName}.${DATA_TYPE_OBJECT_EXPECTED}`,
      'any.required': `${this.entityName}.${MISSING_REQUIRED_PROPERTY}.{{#label}}`
    })
  }

  private validatePayload(payload: P): void {
    const result = this.payloadSchema.validate(payload)
    if (result.error !== undefined) {
      const domainError = new Error(result.error.message)
      if (this.shouldTranslateErrorToClientError()) {
        throw DomainErrorTranslator.instance.translate(domainError)
      }
      throw domainError
    }
  }

  protected abstract shouldTranslateErrorToClientError(): boolean

  protected abstract get entityName(): string
  protected abstract get schema(): Joi.PartialSchemaMap<P>

  get asObject(): P {
    return { ...this.payload }
  }
}

export default DomainEntity
