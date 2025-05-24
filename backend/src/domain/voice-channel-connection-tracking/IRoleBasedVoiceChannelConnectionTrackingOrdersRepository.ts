import { Snowflake } from 'discord.js';
import { Maybe } from 'src/domain/core/primitives/Maybe';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from './RoleBasedVoiceChannelConnectionTrackingOrder';

export interface IRoleBasedVoiceChannelConnectionTrackingOrdersRepository {
  findOneMatching(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<Maybe<RoleBasedVoiceChannelConnectionTrackingOrder>>;

  findAllByTrackedGuildMemberId(
    trackedGuildMemberId: string,
  ): Promise<Maybe<RoleBasedVoiceChannelConnectionTrackingOrder[]>>;

  save(
    roleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;
}
