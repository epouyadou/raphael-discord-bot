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
  GetLastRoleVoiceChannelConnectionStatusQuery,
  GetLastRoleVoiceChannelConnectionStatusQueryResult,
} from './GetLastRoleVoiceChannelConnectionStatusQuery';

@Injectable()
export class GetLastRoleVoiceChannelConnectionStatusQueryHandler {
  private static readonly QUERY_LIMIT = 10;

  constructor(
    @Inject(IUserVoiceChannelStatusRecordsRepositorySymbol)
    private readonly repository: IUserVoiceChannelStatusRecordsRepository,
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  async handle(
    query: GetLastRoleVoiceChannelConnectionStatusQuery,
  ): Promise<GetLastRoleVoiceChannelConnectionStatusQueryResult> {
    const { querierId, guildId, roleId, orderedBy } = query;

    const userIds = await this.communicationPlatform.getUsersByRole(
      guildId,
      roleId,
    );

    console.log('User IDs count:', userIds.length);

    if (userIds.length === 0) {
      return {
        userVoiceConnectionStatus: [],
      };
    }

    const records = await this.repository.fetchLastFromUserIds(
      guildId,
      userIds,
      orderedBy || OrderingType.DESC,
      GetLastRoleVoiceChannelConnectionStatusQueryHandler.QUERY_LIMIT,
    );

    console.log('Fetched records count:', records.length);

    if (records.length === 0) {
      return {
        userVoiceConnectionStatus: [],
      };
    }

    const visibleVoiceChannelFilter = new VisibleVoiceChannelFilter(
      this.communicationPlatform,
      records,
    );

    const filteredRecords: VoiceChannelStatusRecord[] =
      await visibleVoiceChannelFilter.getVisiblesByUser(guildId, querierId);

    console.log('Filtered records count:', filteredRecords.length);

    return {
      userVoiceConnectionStatus: filteredRecords,
    };
  }
}
