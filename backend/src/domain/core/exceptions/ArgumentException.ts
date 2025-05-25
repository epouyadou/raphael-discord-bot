export class ArgumentException extends Error {
  constructor(message: string, argumentName?: string) {
    super(message);
    this.name = 'ArgumentException';
    if (argumentName) {
      this.message += ` - Argument: ${argumentName}`;
    }
  }
}
