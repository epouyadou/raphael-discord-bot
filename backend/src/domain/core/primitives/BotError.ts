export class BotError {
  constructor(
    public readonly code: string,
    public readonly message: string,
  ) {}

  toString(): string {
    return `BotError [${this.code}]: ${this.message}`;
  }

  equals(other: BotError): boolean {
    if (this.code === other.code) {
      return true;
    }
    return false;
  }

  static fromError(error: Error): BotError {
    return new BotError('Unknown', error.message);
  }

  static readonly None = new BotError('None', 'No error occurred');
}
