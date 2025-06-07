import { OrderingType } from '@domain/core/primitives/OrderingType';
import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { Inject } from '@nestjs/common';
import {
  GetLastUserVoiceChannelConnectionStatusQuery,
  GetLastUserVoiceChannelConnectionsQueryResult,
} from './GetLastUserVoiceChannelConnectionStatusQuery';

export class GetLastUserVoiceChannelConnectionStatusQueryHandler {
  QUERY_LIMIT = 10;

  constructor(
    @Inject(IUserVoiceChannelStatusRecordsRepositorySymbol)
    private readonly repository: IUserVoiceChannelStatusRecordsRepository,
  ) {}

  async handle(
    query: GetLastUserVoiceChannelConnectionStatusQuery,
  ): Promise<GetLastUserVoiceChannelConnectionsQueryResult> {
    const { guildId, userId, cursor, orderedBy } = query;

    const records = await this.repository.getFromUserIdAndGuildId(
      guildId,
      userId,
      cursor || 0,
      orderedBy || OrderingType.DESC,
      this.QUERY_LIMIT,
    );

    const previousCursor = query.cursor ? query.cursor - this.QUERY_LIMIT : 0;
    const nextCursor =
      records.length > 0 ? records[records.length - 1].id : undefined;

    return {
      previousCursor,
      nextCursor,
      userVoiceConnectionStatus: records,
    };
  }
}
