import { Injectable } from '@nestjs/common';
import { PostgresPool } from 'src/core/postgres/postgres';
import { IRoleBasedVoiceChannelConnectionTrackingOrdersRepository } from 'src/domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from 'src/domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { Snowflake } from 'src/shared/types/snowflake';
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

  async findAllByTrackedGuildMemberId(
    trackedGuildMemberId: Snowflake,
  ): Promise<RoleBasedVoiceChannelConnectionTrackingOrder[]> {
    const query = `
      SELECT *
      FROM raphaeldb.role_based_voice_channel_connection_tracking_orders
      WHERE tracked_guild_member_id = $1
    `;

    const result = await this.postgres.query(query, [trackedGuildMemberId]);

    return mapAllToRoleBasedVoiceChannelConnectionTrackingOrder(result.rows);
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
}
