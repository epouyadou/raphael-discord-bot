import { Snowflake } from 'discord.js';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from 'src/domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';

type RoleBasedVoiceChannelConnectionTrackingOrderRow = {
  id: number;
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildRoleId: Snowflake;
  createdAt: string;
};

export function mapAllToRoleBasedVoiceChannelConnectionTrackingOrder(
  rows: any[],
): RoleBasedVoiceChannelConnectionTrackingOrder[] {
  const mappedRows = rows as RoleBasedVoiceChannelConnectionTrackingOrderRow[];
  if (!Array.isArray(mappedRows)) {
    throw new Error(
      'Expected rows to be an array of RoleBasedVoiceChannelConnectionTrackingOrderRow',
    );
  }
  if (mappedRows.length === 0) {
    return [];
  }

  return mappedRows.map((row) =>
    RoleBasedVoiceChannelConnectionTrackingOrder.create(
      row.id,
      row.guildId,
      row.trackerGuildMemberId,
      row.trackedGuildRoleId,
      new Date(row.createdAt),
    ),
  );
}
