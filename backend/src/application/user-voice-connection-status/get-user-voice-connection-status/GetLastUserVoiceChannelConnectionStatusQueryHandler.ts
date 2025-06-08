import { OrderingType } from '@domain/core/primitives/OrderingType';
import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Inject } from '@nestjs/common';
import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from './../../abstractions/communication-platform/ICommunicationPlatform';
import {
  GetLastUserVoiceChannelConnectionStatusQuery,
  GetLastUserVoiceChannelConnectionsQueryResult,
} from './GetLastUserVoiceChannelConnectionStatusQuery';

export class GetLastUserVoiceChannelConnectionStatusQueryHandler {
  QUERY_LIMIT = 10;

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

    const records = await this.repository.getFromUserIdAndGuildId(
      guildId,
      userId,
      cursor || 0,
      orderedBy || OrderingType.DESC,
      this.QUERY_LIMIT,
    );

    if (records.length === 0) {
      return {
        previousCursor: undefined,
        nextCursor: undefined,
        userVoiceConnectionStatus: [],
      };
    }

    const visibleVoiceChannelCache = new VisibleVoiceChannelSingleCommandCache(
      this.communicationPlatform,
    );

    const filteredRecords: VoiceChannelStatusRecord[] = [];

    // Slow but avoid multiple calls to the communication platform to check multiple times the same voice channel visibility
    // This is a trade-off between performance and complexity.
    // I don't worry about performance here because the number of records is limited to 10 and this bot is used in a single guild with a limited number of users.
    for (const record of records) {
      let hasPermission = true;

      if (record.fromVoiceChannelId) {
        hasPermission =
          hasPermission &&
          (await visibleVoiceChannelCache.isVisible(
            guildId,
            record.fromVoiceChannelId,
            querierId,
          ));
      }
      if (record.toVoiceChannelId) {
        hasPermission =
          hasPermission &&
          (await visibleVoiceChannelCache.isVisible(
            guildId,
            record.toVoiceChannelId,
            querierId,
          ));
      }

      if (hasPermission) {
        filteredRecords.push(record);
      }
    }

    const previousCursor = query.cursor ? query.cursor - this.QUERY_LIMIT : 0;
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

class VisibleVoiceChannelSingleCommandCache {
  private cache: Set<string> = new Set();

  constructor(private readonly communicationPlatform: ICommunicationPlatform) {}

  async isVisible(
    guildId: string,
    channelId: string,
    userId: string,
  ): Promise<boolean> {
    const cacheKey = `${guildId}-${channelId}-${userId}`;
    if (this.cache.has(cacheKey)) {
      return true;
    }

    const hasPermission =
      await this.communicationPlatform.hasPermissionToAccessTheVoiceChannel(
        guildId,
        channelId,
        userId,
      );

    if (hasPermission) {
      this.cache.add(cacheKey);
    }

    return hasPermission;
  }

  clearCache() {
    this.cache.clear();
  }
}
