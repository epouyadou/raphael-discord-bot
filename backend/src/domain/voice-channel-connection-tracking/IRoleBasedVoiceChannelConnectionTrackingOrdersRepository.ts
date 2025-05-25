import { Snowflake } from 'discord.js';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from './RoleBasedVoiceChannelConnectionTrackingOrder';

export interface IRoleBasedVoiceChannelConnectionTrackingOrdersRepository {
  exist(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackedTrackedRoles(
    guildId: Snowflake,
    trackedtrackedRoles: Snowflake[],
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    roleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;

  deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void>;
}

export const IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol =
  Symbol('IRoleBasedVoiceChannelConnectionTrackingOrdersRepository');
