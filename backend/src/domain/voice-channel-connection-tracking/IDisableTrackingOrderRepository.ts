import { TypedResult } from '@domain/core/primitives/TypedResult';
import { Snowflake } from '@shared/types/snowflake';
import { DisableTrackingOrder } from './DisableTrackingOrder';
export const DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL = Symbol(
  'IDisableTrackingOrderRepository',
);

export interface IDisableTrackingOrderRepository {
  find(
    guildId: Snowflake,
    trackerId: Snowflake,
    target: string,
  ): Promise<TypedResult<DisableTrackingOrder>>;

  save(disableTrackingOrder: DisableTrackingOrder): Promise<void>;
}
