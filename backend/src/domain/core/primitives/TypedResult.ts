import { BotError } from './BotError';
import { Result } from './Result';

export class TypedResult<TValue> extends Result {
  constructor(value: TValue | undefined, isSuccess: boolean, error: BotError) {
    super(isSuccess, error);
    this._value = value;
  }

  private readonly _value: TValue | undefined;

  get value(): TValue {
    if (!this.isSuccess()) {
      throw new Error('Cannot access value of a failed result');
    }
    if (!this._value) {
      throw new Error('Value is undefined');
    }
    return this._value;
  }

  static typedSuccess<TValue>(value: TValue): TypedResult<TValue> {
    return new TypedResult<TValue>(value, true, BotError.None);
  }

  static typedFailure<TValue>(error: BotError): TypedResult<TValue> {
    return new TypedResult<TValue>(undefined, false, error);
  }

  static create<TValue>(
    value?: TValue,
    error: BotError = BotError.None,
  ): Result {
    if (value === undefined || value === null) {
      return this.typedFailure(error);
    } else {
      return this.typedSuccess(value);
    }
  }
}
