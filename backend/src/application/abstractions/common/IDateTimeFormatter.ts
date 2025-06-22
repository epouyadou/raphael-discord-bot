export const DATE_TIME_FORMATTER_SYMBOL = Symbol('IDateTimeFormatter');

export interface IDateTimeFormatter {
  formatDateTime(date: Date): string;
  formatDate(date: Date): string;
  formatTime(date: Date): string;
}
