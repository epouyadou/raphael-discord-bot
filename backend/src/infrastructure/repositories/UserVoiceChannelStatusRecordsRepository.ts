import { OrderingType } from '@domain/core/primitives/OrderingType';
import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { PostgresPool } from '@infrastructure/database/postgres/postgres';
import { mapToUserVoiceChannelStatusRecords } from '@infrastructure/mappers/UserVoiceChannelStatusRecordsMapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserVoiceChannelStatusRecordsRepository
  implements IUserVoiceChannelStatusRecordsRepository
{
  constructor(private readonly postgres: PostgresPool) {}

  async fetchAllFromUserId(
    guildId: string,
    guildMemberId: string,
    cursor: number,
    orderBy: OrderingType,
    limit: number,
  ): Promise<VoiceChannelStatusRecord[]> {
    const query = `
      SELECT *
      FROM raphaeldb.voice_channel_status_records
      WHERE guild_id = $1
        AND guild_member_id = $2
        AND id > $3
      ORDER BY id ${orderBy}
      LIMIT $4
    `;

    const result = await this.postgres.query(query, [
      guildId,
      guildMemberId,
      cursor,
      limit,
    ]);

    return mapToUserVoiceChannelStatusRecords(result);
  }

  async fetchLastFromUserIds(
    guildId: string,
    guildMemberIds: string[],
    orderBy: OrderingType,
    limit: number,
  ): Promise<VoiceChannelStatusRecord[]> {
    if (guildMemberIds.length === 0) {
      return Promise.resolve([]);
    }

    // const placeholders = guildMemberIds
    //   .map((memberId) => `$${memberId}`)
    //   .join(', ');

    const query = `
      SELECT *
      FROM raphaeldb.voice_channel_status_records
      WHERE guild_id = $1
        AND guild_member_id = ANY($2)
      ORDER BY id ${orderBy}
      LIMIT $3
    `;

    const result = await this.postgres.query(query, [
      guildId,
      guildMemberIds,
      limit,
    ]);

    console.log(
      `Fetched ${result.rowCount} records for guild ${guildId} and members ${guildMemberIds.join(
        ', ',
      )} with order ${orderBy}`,
    );

    return mapToUserVoiceChannelStatusRecords(result);
  }

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
