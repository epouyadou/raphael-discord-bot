import { ICommunicationPlatform } from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { Snowflake } from '@shared/types/snowflake';
import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export class VisibleVoiceChannelFilter {
  private cache: Set<string> = new Set();

  constructor(
    private readonly communicationPlatform: ICommunicationPlatform,
    private readonly records: VoiceChannelStatusRecord[] = [],
  ) {}

  private async isVisible(
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

  async getVisiblesByUser(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceChannelStatusRecord[]> {
    const filteredRecords: VoiceChannelStatusRecord[] = [];

    // Slow but avoid multiple calls to the communication platform to check multiple times the same voice channel visibility
    // This is a trade-off between performance and complexity.
    // I don't worry about performance here because the number of records is limited to 10 and this bot is used in a single guild with a limited number of users.
    for (const record of this.records) {
      let hasPermission = true;

      if (record.fromVoiceChannelId) {
        hasPermission =
          hasPermission &&
          (await this.isVisible(guildId, record.fromVoiceChannelId, userId));
      }
      if (record.toVoiceChannelId) {
        hasPermission =
          hasPermission &&
          (await this.isVisible(guildId, record.toVoiceChannelId, userId));
      }

      if (hasPermission) {
        filteredRecords.push(record);
      }
    }

    return filteredRecords;
  }
}
