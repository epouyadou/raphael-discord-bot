import { Snowflake } from '@shared/types/snowflake';

export type RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand = {
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildMemberId: Snowflake;
};
