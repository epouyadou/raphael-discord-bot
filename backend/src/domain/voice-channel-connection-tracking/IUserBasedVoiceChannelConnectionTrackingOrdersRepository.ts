import { Snowflake } from 'src/shared/types/snowflake';
import { Maybe } from '../core/primitives/Maybe';
import { UserBasedVoiceChannelConnectionTrackingOrder } from './UserBasedVoiceChannelConnectionTrackingOrders';

export interface IUserBasedVoiceChannelConnectionTrackingOrdersRepository {
  findOneMatching(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<Maybe<UserBasedVoiceChannelConnectionTrackingOrder>>;

  findAllByTrackedGuildMemberId(
    trackedGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;
}
