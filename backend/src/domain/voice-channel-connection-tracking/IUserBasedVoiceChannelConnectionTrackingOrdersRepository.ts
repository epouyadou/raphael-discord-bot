import { Snowflake } from '@shared/types/snowflake';
import { UserBasedVoiceChannelConnectionTrackingOrder } from './UserBasedVoiceChannelConnectionTrackingOrder';

export interface IUserBasedVoiceChannelConnectionTrackingOrdersRepository {
  exists(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackerTrackingOrders(
    guildId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;

  deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void>;
}

export const IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol =
  Symbol('IUserBasedVoiceChannelConnectionTrackingOrdersRepository');
