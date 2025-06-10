export const IDateTimeFormatterSymbol = Symbol('IDateTimeFormatter');

export interface IDateTimeFormatter {
  formatDateTime(date: Date): string;
  formatDate(date: Date): string;
  formatTime(date: Date): string;
}
