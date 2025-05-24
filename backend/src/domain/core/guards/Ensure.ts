import { ArgumentException } from '../exceptions/ArgumentException';

export class Ensure {
  static notNullOrUndefined<T>(
    value: T,
    message: string,
    argumentName: string,
  ): void {
    if (value === null || value === undefined) {
      throw new ArgumentException(message, argumentName);
    }
  }

  static notEmpty(value: string, message: string, argumentName: string): void {
    if (value === null || value === undefined || value.trim() === '') {
      throw new ArgumentException(message, argumentName);
    }
  }
}
