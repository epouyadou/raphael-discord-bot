import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Snowflake } from '@shared/types/snowflake';
import { OrderingType } from '../../../domain/core/primitives/OrderingType';

export type GetLastRoleVoiceChannelConnectionStatusQuery = {
  querierId: Snowflake;
  guildId: Snowflake;
  roleId: Snowflake;
  orderedBy?: OrderingType;
};

export type GetLastRoleVoiceChannelConnectionStatusQueryResult = {
  userVoiceConnectionStatus: VoiceChannelStatusRecord[];
};
