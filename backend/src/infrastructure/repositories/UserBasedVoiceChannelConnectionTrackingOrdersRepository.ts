import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrder';
import { PostgresPool } from '@infrastructure/database/postgres/postgres';
import { Injectable } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { mapAllToUserBasedVoiceChannelConnectionTrackingOrder } from '../mappers/UserBasedVoiceChannelConnectionTrackingOrderMapper';

@Injectable()
export class UserBasedVoiceChannelConnectionTrackingOrdersRepository
  implements IUserBasedVoiceChannelConnectionTrackingOrdersRepository
{
  constructor(private readonly postgres: PostgresPool) {}

  async exists(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean> {
    const query = `
      SELECT 1
      FROM raphaeldb.user_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
        AND tracked_guild_member_id = $3
    `;

    const result = await this.postgres.query(query, [
      guildId,
      trackerGuildMemberId,
      trackedGuildMemberId,
    ]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  async findAllByTrackerTrackingOrders(
    guildId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[]> {
    // Implementation goes here
    const query = `
      SELECT *
      FROM raphaeldb.user_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracked_guild_member_id = $2
    `;
    const result = await this.postgres.query(query, [
      guildId,
      trackedGuildMemberId,
    ]);

    return mapAllToUserBasedVoiceChannelConnectionTrackingOrder(result);
  }

  async save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void> {
    const query = `
      INSERT INTO raphaeldb.user_based_voice_channel_connection_tracking_orders (
        guild_id,
        tracker_guild_member_id,
        tracked_guild_member_id,
        created_at
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `;

    await this.postgres.query(query, [
      userVoiceChannelConnectionTrackingOrders.guildId,
      userVoiceChannelConnectionTrackingOrders.trackerGuildMemberId,
      userVoiceChannelConnectionTrackingOrders.trackedGuildMemberId,
      userVoiceChannelConnectionTrackingOrders.createdAt.toISOString(),
    ]);
  }

  async delete(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
  ): Promise<boolean> {
    const query = `
      DELETE FROM raphaeldb.user_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
        AND tracked_guild_member_id = $3
    `;

    const result = await this.postgres.query(query, [
      guildId,
      trackerGuildMemberId,
      trackedGuildMemberId,
    ]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteAllOfTracker(
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
  ): Promise<void> {
    const query = `
      DELETE FROM raphaeldb.user_based_voice_channel_connection_tracking_orders
      WHERE guild_id = $1
        AND tracker_guild_member_id = $2
    `;

    await this.postgres.query(query, [guildId, trackerGuildMemberId]);
  }
}

export const UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider = {
  provide: IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
  useClass: UserBasedVoiceChannelConnectionTrackingOrdersRepository,
};
