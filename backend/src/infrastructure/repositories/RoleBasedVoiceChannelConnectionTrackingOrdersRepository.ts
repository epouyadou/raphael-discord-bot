import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { PostgresPool } from '@infrastructure/database/postgres/postgres';
import { Injectable } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { mapAllToRoleBasedVoiceChannelConnectionTrackingOrder } from '../mappers/RoleBasedVoiceChannelConnectionTrackingOrderMapper';

@Injectable()
export class RoleBasedVoiceChannelConnectionTrackingOrdersRepository
  implements IRoleBasedVoiceChannelConnectionTrackingOrdersRepository
{
  constructor(private readonly postgres: PostgresPool) {}

  async exist(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean> {
    const query = `
      SELECT 1
      FROM raphaeldb.role_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
        AND tracked_guild_role_id = $3
    `;

    const result = await this.postgres.query(query, [
      guildId,
      trackerGuildMemberId,
      trackedGuildRoleId,
    ]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  async findAllByTrackedTrackedRoles(
    guildId: Snowflake,
    trackedtrackedRoles: Snowflake[],
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]> {
    const query = `
      SELECT *
      FROM raphaeldb.role_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracked_guild_role_id = ANY($2)
    `;

    const result = await this.postgres.query(query, [
      guildId,
      trackedtrackedRoles,
    ]);

    return mapAllToRoleBasedVoiceChannelConnectionTrackingOrder(result);
  }

  async save(
    roleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void> {
    const query = `
      INSERT INTO raphaeldb.role_based_voice_channel_connection_tracking_orders (
        guild_id,
        tracker_guild_member_id,
        tracked_guild_role_id,
        created_at
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `;

    await this.postgres.query(query, [
      roleBasedVoiceChannelConnectionTrackingOrder.guildId,
      roleBasedVoiceChannelConnectionTrackingOrder.trackerGuildMemberId,
      roleBasedVoiceChannelConnectionTrackingOrder.trackedGuildRoleId,
      roleBasedVoiceChannelConnectionTrackingOrder.createdAt.toISOString(),
    ]);
  }

  async delete(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
  ): Promise<boolean> {
    const query = `
      DELETE FROM raphaeldb.role_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
        AND tracked_guild_role_id = $3
    `;

    const result = await this.postgres.query(query, [
      guildId,
      trackerGuildMemberId,
      trackedGuildRoleId,
    ]);

    console.log(JSON.stringify(result, null, 2));

    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void> {
    const query = `
      DELETE FROM raphaeldb.role_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
    `;

    await this.postgres.query(query, [guildId, trackerGuildMemberId]);
  }
}

export const RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider = {
  provide: IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
  useClass: RoleBasedVoiceChannelConnectionTrackingOrdersRepository,
};
