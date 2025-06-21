import { Snowflake } from './../../shared/types/snowflake';
export const IDisableTrackingOrderRepositorySymbol = Symbol(
  'IDisableTrackingOrderRepository',
);

export interface IDisableTrackingOrderRepository {
  save(
    guildId: Snowflake,
    userId: Snowflake,
    mentionableId?: Snowflake,
    time?: string,
  ): Promise<void>;
}
