export class NotFoundException extends Error {
  constructor(variableName: string) {
    super('NotFoundException: ' + variableName);
  }
}
