import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Snowflake } from '@shared/types/snowflake';
import { OrderingType } from '../../../domain/core/primitives/OrderingType';

export type GetLastUserVoiceChannelConnectionStatusQuery = {
  querierId: Snowflake;
  guildId: Snowflake;
  userId: Snowflake;
  cursor?: number;
  orderedBy?: OrderingType;
};

export type GetLastUserVoiceChannelConnectionsQueryResult = {
  previousCursor?: number;
  nextCursor?: number;
  userVoiceConnectionStatus: VoiceChannelStatusRecord[];
};
