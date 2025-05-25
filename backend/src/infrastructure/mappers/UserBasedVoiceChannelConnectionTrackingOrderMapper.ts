import { UserBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrder';
import { Snowflake } from 'discord.js';
import { QueryResult } from 'pg';

/**
 * This type represents the structure of a row in the database for
 * user_based_voice_channel_connection_tracking_orders table.
 * It is used to map the database result to the domain model.
 * @property {number} id - The unique identifier for the tracking order.
 * @property {Snowflake} guildId - The ID of the guild where the tracking order is created.
 * @property {Snowflake} trackerGuildMemberId - The ID of the guild member who is tracking.
 * @property {Snowflake} trackedGuildMemberId - The ID of the guild member being tracked.
 * @property {string} createdAt - The timestamp when the tracking order was created.
 **/
type UserBasedVoiceChannelConnectionTrackingOrderRow = {
  id: number;
  guild_id: Snowflake;
  tracker_guild_member_id: Snowflake;
  tracked_guild_member_id: Snowflake;
  created_at: string;
};

/**
 * Maps a database result to an array of UserBasedVoiceChannelConnectionTrackingOrder domain objects.
 * @param {QueryResult<any>} result - The result from the database query.
 * @returns {UserBasedVoiceChannelConnectionTrackingOrder[]} An array of UserBasedVoiceChannelConnectionTrackingOrder objects.
 * @throws {Error} If the result does not contain rows or if the rows are not in the expected format.
 */
export function mapAllToUserBasedVoiceChannelConnectionTrackingOrder(
  result: QueryResult<any>,
): UserBasedVoiceChannelConnectionTrackingOrder[] {
  if (result.rowCount === 0) {
    return [];
  }

  const mappedRows =
    result.rows as UserBasedVoiceChannelConnectionTrackingOrderRow[];

  return mappedRows.map((row) => {
    return UserBasedVoiceChannelConnectionTrackingOrder.create(
      row.id,
      row.guild_id,
      row.tracker_guild_member_id,
      row.tracked_guild_member_id,
      new Date(row.created_at),
    );
  });
}
