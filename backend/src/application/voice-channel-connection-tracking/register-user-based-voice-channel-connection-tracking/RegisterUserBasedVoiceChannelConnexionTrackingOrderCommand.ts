import { Snowflake } from 'src/shared/types/snowflake';

export type RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand = {
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildMemberId: Snowflake;
};
