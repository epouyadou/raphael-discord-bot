export const IDateTimeFormatterSymbol = Symbol('IDateTimeFormatter');

export interface IDateTimeFormatter {
  formatDateTime(date: Date): string;
}
