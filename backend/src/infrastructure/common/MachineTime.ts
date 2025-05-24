import { IDateTime } from 'src/application/abstractions/common/IDateTime';

export class MachineTime implements IDateTime {
  /**
   * Returns the current UTC date and time.
   * @returns {Date} The current UTC date and time.
   */
  utcNow(): Date {
    return new Date(Date.now());
  }
}
