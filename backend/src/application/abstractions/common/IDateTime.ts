export const IDateTimeSymbol = Symbol('IDateTime');

export interface IDateTime {
  utcNow(): Date;
}
