import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { QueryResult } from 'pg';

export type UserVoiceChannelStatusRecordRow = {
  id: number;
  guild_id: string;
  guild_member_id: string;
  from_guild_channel_id: string | null;
  to_guild_channel_id: string | null;
  created_at: string;
};

export function mapToUserVoiceChannelStatusRecords(
  result: QueryResult<any>,
): VoiceChannelStatusRecord[] {
  if (result.rowCount === 0) {
    return [];
  }

  const mappedRows = result.rows as UserVoiceChannelStatusRecordRow[];

  return mappedRows.map((row) => {
    return VoiceChannelStatusRecord.create(
      row.id,
      row.guild_id,
      row.guild_member_id,
      row.from_guild_channel_id,
      row.to_guild_channel_id,
      new Date(row.created_at),
    );
  });
}
