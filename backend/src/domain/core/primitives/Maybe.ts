export class Maybe<T> {
  private value: T | null;

  constructor(value: T | null) {
    this.value = value;
  }

  static of<T>(value: T | null): Maybe<T> {
    return new Maybe(value);
  }

  hasValue(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  hasNoValue(): boolean {
    return !this.hasValue();
  }

  get(): T {
    if (!this.hasValue()) {
      throw new Error('Value is not present');
    }
    return this.value as T;
  }

  orElse(defaultValue: T): T {
    return this.hasValue() ? (this.value as T) : defaultValue;
  }

  equals(other: Maybe<T>): boolean {
    if (this.hasNoValue() && other.hasNoValue()) {
      return true;
    }
    if (this.hasValue() && other.hasValue()) {
      return this.get() === other.get();
    }
    return false;
  }
}
