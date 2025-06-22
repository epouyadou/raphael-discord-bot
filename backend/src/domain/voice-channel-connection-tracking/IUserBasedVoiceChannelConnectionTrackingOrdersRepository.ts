import { Snowflake } from '@shared/types/snowflake';
import { UserBasedVoiceChannelConnectionTrackingOrder } from './UserBasedVoiceChannelConnectionTrackingOrder';

export const USER_BASED_VOICE_CHANNEL_CONNECTION_TRACKING_ORDER_REPOSITORY_SYMBOL =
  Symbol('IUserBasedVoiceChannelConnectionTrackingOrdersRepository');

export interface IUserBasedVoiceChannelConnectionTrackingOrdersRepository {
  exists(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackedGuildMemberId(
    guildId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]>;

  findAllByTrackerGuildMemberId(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;

  delete(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean>;

  deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void>;
}
