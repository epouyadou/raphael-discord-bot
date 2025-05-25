import { Snowflake } from 'discord.js';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from './RoleBasedVoiceChannelConnectionTrackingOrder';

export interface IRoleBasedVoiceChannelConnectionTrackingOrdersRepository {
  exist(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean>;

  findAllByTrackedGuildMemberId(
    trackedGuildMemberId: Snowflake,
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]>;

  save(
    roleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;
}

export const IRoleBasedVoiceChannelConnectionTrackingOrdersRepository = Symbol(
  'IRoleBasedVoiceChannelConnectionTrackingOrdersRepository',
);
