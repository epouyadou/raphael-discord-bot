import {
  DURATION_PARSER_SYMBOL,
  IDurationParser,
} from '@application/abstractions/common/IDurationParser';

export class DurationParser implements IDurationParser {
  /** @inheritdoc */
  parse(duration?: string): number | never {
    if (!duration) {
      throw new Error('Duration string must not be empty');
    }

    const regex: RegExp = /(\d+)([smhd])/g;
    let totalMilliseconds: number = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(duration)) !== null) {
      const value = this.parseNumber(match[1]);
      const unit = this.parseUnit(match[2]);
      totalMilliseconds += value * unit;
    }

    if (totalMilliseconds === 0) {
      throw new Error(`Invalid duration string: ${duration}`);
    }

    return totalMilliseconds;
  }

  private parseUnit(unit: string): number | never {
    switch (unit) {
      case 's':
        return 1000; // seconds to milliseconds
      case 'm':
        return 60 * 1000; // minutes to milliseconds
      case 'h':
        return 60 * 60 * 1000; // hours to milliseconds
      case 'd':
        return 24 * 60 * 60 * 1000; // days to milliseconds
      case 'w':
        return 7 * 24 * 60 * 60 * 1000; // weeks to milliseconds
      case 'M': {
        return this.parseMonth(); // months to milliseconds
      }
      case 'Y': {
        return this.parseYear(); // years to milliseconds
      }
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  private parseNumber(value: string): number | never {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return parsedValue;
  }

  private parseMonth(): number {
    const currentDate = new Date();
    const nextMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
    );
    const monthDifference = nextMonthDate.getTime() - currentDate.getTime();
    return monthDifference; // months to milliseconds
  }

  private parseYear(): number {
    const currentDate = new Date();
    const nextYearDate = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const yearDifference = nextYearDate.getTime() - currentDate.getTime();
    return yearDifference; // years to milliseconds
  }
}

export const DurationParserProvider = {
  provide: DURATION_PARSER_SYMBOL,
  useClass: DurationParser,
};
