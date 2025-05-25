export interface IDateTime {
  utcNow(): Date;
}

export const IDateTimeSymbol = Symbol('IDateTime');
