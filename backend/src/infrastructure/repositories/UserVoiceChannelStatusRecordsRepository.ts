import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Injectable } from '@nestjs/common';
import { PostgresPool } from 'src/core/postgres/postgres';

@Injectable()
export class UserVoiceChannelStatusRecordsRepository
  implements IUserVoiceChannelStatusRecordsRepository
{
  constructor(private readonly postgres: PostgresPool) {}

  async save(
    voiceChannelStatusRecord: VoiceChannelStatusRecord,
  ): Promise<void> {
    const query = `
      INSERT INTO raphaeldb.voice_channel_status_records (
        guild_id,
        guild_member_id,
        from_guild_channel_id,
        to_guild_channel_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    await this.postgres.query(query, [
      voiceChannelStatusRecord.guildId,
      voiceChannelStatusRecord.guildMemberId,
      voiceChannelStatusRecord.fromVoiceChannelId,
      voiceChannelStatusRecord.toVoiceChannelId,
      voiceChannelStatusRecord.createdAt,
    ]);
  }
}

export const UserVoiceChannelStatusRecordsRepositoryProvider = {
  provide: IUserVoiceChannelStatusRecordsRepositorySymbol,
  useClass: UserVoiceChannelStatusRecordsRepository,
};
