import { Snowflake } from 'src/shared/types/snowflake';

export type RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand = {
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildRoleId: Snowflake;
};
