import { RoleBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { Snowflake } from 'discord.js';
import { QueryResult } from 'pg';

/**
 * This type represents the structure of a row in the database for
 * role_based_voice_channel_connection_tracking_orders table.
 * It is used to map the database result to the domain model.
 * @property {number} id - The unique identifier for the tracking order.
 * @property {Snowflake} guildId - The ID of the guild where the tracking order is created.
 * @property {Snowflake} trackerGuildMemberId - The ID of the guild member who is tracking.
 * @property {Snowflake} trackedGuildRoleId - The ID of the guild role being tracked.
 * @property {string} createdAt - The timestamp when the tracking order was created.
 **/
type RoleBasedVoiceChannelConnectionTrackingOrderRow = {
  id: number;
  guild_id: Snowflake;
  tracker_guild_member_id: Snowflake;
  tracked_guild_role_id: Snowflake;
  created_at: string;
};

/**
 * Maps a database query result to an array of RoleBasedVoiceChannelConnectionTrackingOrder domain objects.
 * @param {QueryResult<any>} result - The result of the database query.
 * @returns {RoleBasedVoiceChannelConnectionTrackingOrder[]} An array of RoleBasedVoiceChannelConnectionTrackingOrder objects.
 */
export function mapAllToRoleBasedVoiceChannelConnectionTrackingOrder(
  result: QueryResult<any>,
): RoleBasedVoiceChannelConnectionTrackingOrder[] {
  if (result.rowCount === 0) {
    return [];
  }

  const mappedRows =
    result.rows as RoleBasedVoiceChannelConnectionTrackingOrderRow[];

  return mappedRows.map((row) => {
    return RoleBasedVoiceChannelConnectionTrackingOrder.create(
      row.id,
      row.guild_id,
      row.tracker_guild_member_id,
      row.tracked_guild_role_id,
      new Date(row.created_at),
    );
  });
}
