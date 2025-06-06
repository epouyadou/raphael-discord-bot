import { Snowflake } from 'discord.js';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from './RoleBasedVoiceChannelConnectionTrackingOrder';

export const IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol =
  Symbol('IRoleBasedVoiceChannelConnectionTrackingOrdersRepository');
export interface IRoleBasedVoiceChannelConnectionTrackingOrdersRepository {
  exists(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackedTrackedRoles(
    guildId: Snowflake,
    trackedtrackedRoles: Snowflake[],
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]>;

  findAllByTrackerGuildMemberId(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    roleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;

  delete(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean>;

  deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void>;
}
