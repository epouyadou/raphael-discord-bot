import { InvalidOperationException } from '../exceptions/InvalidOperationException';
import { BotError } from './BotError';
import { TypedResult } from './TypedResult';

export class Result {
  constructor(
    private readonly _isSuccess: boolean,
    public readonly error: BotError,
  ) {
    if (_isSuccess && error !== BotError.None) {
      throw new InvalidOperationException();
    } else if (!_isSuccess && error === BotError.None) {
      throw new InvalidOperationException();
    }

    this._isSuccess = _isSuccess;
    this.error = error;
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isFailure(): boolean {
    return !this._isSuccess;
  }

  static success(): Result {
    return new Result(true, BotError.None);
  }

  static typeSuccess<TValue>(value: TValue): TypedResult<TValue> {
    return new TypedResult<TValue>(value, true, BotError.None);
  }

  static create<TValue>(
    value?: TValue,
    error: BotError = BotError.None,
  ): Result {
    if (value === undefined || value === null) {
      return this.typedFailure(error);
    } else {
      return this.typeSuccess(value);
    }
  }

  static failure(error: BotError): Result {
    return new Result(false, error);
  }

  static typedFailure<TValue>(error: BotError): TypedResult<TValue> {
    return new TypedResult<TValue>(undefined, false, error);
  }

  static firstFailureOrSuccess(...results: Result[]): Result {
    for (const result of results) {
      if (result.isFailure()) {
        return result;
      }
    }
    return Result.success();
  }
}
