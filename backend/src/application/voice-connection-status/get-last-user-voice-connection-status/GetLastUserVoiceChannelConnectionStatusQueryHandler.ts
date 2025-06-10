import { OrderingType } from '@domain/core/primitives/OrderingType';
import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { VisibleVoiceChannelFilter } from '@domain/voice-channel-status-records/VisibleVoiceChannelSingleCommandCache';
import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Inject, Injectable } from '@nestjs/common';
import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from './../../abstractions/communication-platform/ICommunicationPlatform';
import {
  GetLastUserVoiceChannelConnectionStatusQuery,
  GetLastUserVoiceChannelConnectionsQueryResult,
} from './GetLastUserVoiceChannelConnectionStatusQuery';

@Injectable()
export class GetLastUserVoiceChannelConnectionStatusQueryHandler {
  private static readonly QUERY_LIMIT = 10;

  constructor(
    @Inject(IUserVoiceChannelStatusRecordsRepositorySymbol)
    private readonly repository: IUserVoiceChannelStatusRecordsRepository,
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  async handle(
    query: GetLastUserVoiceChannelConnectionStatusQuery,
  ): Promise<GetLastUserVoiceChannelConnectionsQueryResult> {
    const { querierId, guildId, userId, cursor, orderedBy } = query;

    const records = await this.repository.fetchAllFromUserId(
      guildId,
      userId,
      cursor || 0,
      orderedBy || OrderingType.DESC,
      GetLastUserVoiceChannelConnectionStatusQueryHandler.QUERY_LIMIT,
    );

    if (records.length === 0) {
      return {
        previousCursor: undefined,
        nextCursor: undefined,
        userVoiceConnectionStatus: [],
      };
    }

    const visibleVoiceChannelFilter = new VisibleVoiceChannelFilter(
      this.communicationPlatform,
      records,
    );

    const filteredRecords: VoiceChannelStatusRecord[] =
      await visibleVoiceChannelFilter.getVisiblesByUser(guildId, querierId);

    const previousCursor = query.cursor
      ? query.cursor -
        GetLastUserVoiceChannelConnectionStatusQueryHandler.QUERY_LIMIT
      : 0;
    const nextCursor =
      filteredRecords.length > 0
        ? filteredRecords[filteredRecords.length - 1].id
        : undefined;

    return {
      previousCursor,
      nextCursor,
      userVoiceConnectionStatus: filteredRecords,
    };
  }
}
