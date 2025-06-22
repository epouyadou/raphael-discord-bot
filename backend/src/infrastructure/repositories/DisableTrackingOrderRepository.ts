import { BotError } from '@domain/core/primitives/BotError';
import { TypedResult } from '@domain/core/primitives/TypedResult';
import {
  DisableTrackingOrder,
  INDEFINITE_DISABLE_TRACKING_DURATION,
  ReenbleingDateTime,
} from '@domain/voice-channel-connection-tracking/DisableTrackingOrder';
import {
  DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL,
  IDisableTrackingOrderRepository,
} from '@domain/voice-channel-connection-tracking/IDisableTrackingOrderRepository';
import {
  REDIS_CLIENT_POOL_SYMBOL,
  RedisPool,
} from '@infrastructure/database/redis/redis_provider';
import { Inject } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';

export class DisableTrackingOrderRepository
  implements IDisableTrackingOrderRepository
{
  constructor(
    @Inject(REDIS_CLIENT_POOL_SYMBOL) private readonly redis: RedisPool,
  ) {}

  async find(
    guildId: Snowflake,
    trackerId: Snowflake,
    target: string,
  ): Promise<TypedResult<DisableTrackingOrder>> {
    const key = this.getKey(guildId, trackerId, target);

    const value = await this.redis.get(key);

    if (!value) {
      return TypedResult.typedFailure(BotError.None);
    }

    const reenbleingDateTime: ReenbleingDateTime =
      value === INDEFINITE_DISABLE_TRACKING_DURATION
        ? INDEFINITE_DISABLE_TRACKING_DURATION
        : new Date(value);

    const disableTrackingOrder = DisableTrackingOrder.create({
      guildId: guildId,
      trackerId: trackerId,
      targetId: target,
      reenbleingDateTime: reenbleingDateTime,
    });

    return TypedResult.typedSuccess(disableTrackingOrder);
  }

  async save(disableTrackingOrder: DisableTrackingOrder): Promise<void> {
    const key = this.getKey(
      disableTrackingOrder.guildId,
      disableTrackingOrder.trackerId,
      disableTrackingOrder.target,
    );

    const value =
      disableTrackingOrder.reenbleingDateTime instanceof Date
        ? disableTrackingOrder.reenbleingDateTime.toISOString()
        : disableTrackingOrder.reenbleingDateTime;

    await this.redis.set(key, value);
  }

  private getKey(
    guildId: Snowflake,
    trackerId: Snowflake,
    target: string,
  ): string {
    return `disable-tracking:${guildId}:${trackerId}:${target}`;
  }
}

export const DisableTrackingOrderRepositoryProvider = {
  provide: DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL,
  useClass: DisableTrackingOrderRepository,
};
