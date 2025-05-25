import { Snowflake } from 'src/shared/types/snowflake';
import { UserBasedVoiceChannelConnectionTrackingOrder } from './UserBasedVoiceChannelConnectionTrackingOrder';

export interface IUserBasedVoiceChannelConnectionTrackingOrdersRepository {
  exists(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackedGuildMemberId(
    trackedGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;
}

export const IUserBasedVoiceChannelConnectionTrackingOrdersRepository = Symbol(
  'IUserBasedVoiceChannelConnectionTrackingOrdersRepository',
);
