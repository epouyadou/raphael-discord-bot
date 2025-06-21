import {
  IDisableTrackingOrderRepository,
  IDisableTrackingOrderRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IDisableTrackingOrderRepository';
import {
  REDIS_CLIENT_POOL,
  RedisPool,
} from '@infrastructure/database/redis/redis_provider';
import { Inject } from '@nestjs/common';

export class DisableTrackingOrderRepository
  implements IDisableTrackingOrderRepository
{
  constructor(@Inject(REDIS_CLIENT_POOL) private readonly redis: RedisPool) {}

  async save(
    guildId: string,
    userId: string,
    target: string,
    duration: string,
  ): Promise<void> {
    const key = `disable-tracking:${guildId}:${userId}:${target}`;
    const value = duration;

    await this.redis.set(key, value);
  }
}

export const DisableTrackingOrderRepositoryProvider = {
  provide: IDisableTrackingOrderRepositorySymbol,
  useClass: DisableTrackingOrderRepository,
};
