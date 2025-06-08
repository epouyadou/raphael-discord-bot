import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { OrderingType } from '../../../domain/core/primitives/OrderingType';

export type GetLastUserVoiceChannelConnectionStatusQuery = {
  querierId: string;
  guildId: string;
  userId: string;
  cursor?: number;
  orderedBy?: OrderingType;
};

export type GetLastUserVoiceChannelConnectionsQueryResult = {
  previousCursor?: number;
  nextCursor?: number;
  userVoiceConnectionStatus: VoiceChannelStatusRecord[];
};
