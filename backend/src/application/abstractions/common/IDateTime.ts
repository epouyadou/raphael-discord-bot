export const DATE_TIME_SYMBOL = Symbol('IDateTime');

export interface IDateTime {
  utcNow(): Date;
}
