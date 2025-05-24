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
}
