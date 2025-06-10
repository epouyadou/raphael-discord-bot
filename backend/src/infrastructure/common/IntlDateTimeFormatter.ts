import {
  IDateTimeFormatter,
  IDateTimeFormatterSymbol,
} from '@application/abstractions/common/IDateTimeFormatter';

export class IntlDateTimeFormmatter implements IDateTimeFormatter {
  private readonly dateTimeFormatter: Intl.DateTimeFormat;
  private readonly dateFormatter: Intl.DateTimeFormat;
  private readonly TimeFormatter: Intl.DateTimeFormat;

  private readonly dateTimeOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  private readonly dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  private readonly timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };

  constructor() {
    this.dateTimeFormatter = new Intl.DateTimeFormat(
      'en-US',
      this.dateTimeOptions,
    );
    this.dateFormatter = new Intl.DateTimeFormat('en-US', this.dateOptions);
    this.TimeFormatter = new Intl.DateTimeFormat('en-US', this.timeOptions);
  }

  formatDateTime(date: Date): string {
    return this.dateTimeFormatter.format(date);
  }

  formatDate(date: Date): string {
    return this.dateFormatter.format(date);
  }

  formatTime(date: Date): string {
    return this.TimeFormatter.format(date);
  }
}

export const IntlDateTimeFormmatterProvider = {
  provide: IDateTimeFormatterSymbol,
  useClass: IntlDateTimeFormmatter,
};
