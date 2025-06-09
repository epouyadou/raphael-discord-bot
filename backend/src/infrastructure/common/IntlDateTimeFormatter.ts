import {
  IDateTimeFormatter,
  IDateTimeFormatterSymbol,
} from '@application/abstractions/common/IDateTimeFormatter';

export class IntlDateTimeFormmatter implements IDateTimeFormatter {
  private readonly dateTimeFormat: Intl.DateTimeFormat;
  private readonly options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  };

  constructor() {
    this.dateTimeFormat = new Intl.DateTimeFormat('en-US', this.options);
  }

  formatDateTime(date: Date): string {
    return this.dateTimeFormat.format(date);
  }
}

export const IntlDateTimeFormmatterProvider = {
  provide: IDateTimeFormatterSymbol,
  useClass: IntlDateTimeFormmatter,
};
