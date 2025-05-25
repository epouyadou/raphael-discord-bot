import { Snowflake } from 'discord.js';
import { UserBasedVoiceChannelConnectionTrackingOrder } from 'src/domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrder';

type UserBasedVoiceChannelConnectionTrackingOrderRow = {
  id: number;
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildMemberId: Snowflake;
  createdAt: string;
};

export function mapAllToUserBasedVoiceChannelConnectionTrackingOrder(
  rows: any[],
): UserBasedVoiceChannelConnectionTrackingOrder[] {
  const mappedRows = rows as UserBasedVoiceChannelConnectionTrackingOrderRow[];
  if (!Array.isArray(mappedRows)) {
    throw new Error(
      'Expected rows to be an array of UserBasedVoiceChannelConnectionTrackingOrderRow',
    );
  }
  if (mappedRows.length === 0) {
    return [];
  }

  return mappedRows.map((row) =>
    UserBasedVoiceChannelConnectionTrackingOrder.create(
      row.id,
      row.guildId,
      row.trackerGuildMemberId,
      row.trackedGuildMemberId,
      new Date(row.createdAt),
    ),
  );
}
