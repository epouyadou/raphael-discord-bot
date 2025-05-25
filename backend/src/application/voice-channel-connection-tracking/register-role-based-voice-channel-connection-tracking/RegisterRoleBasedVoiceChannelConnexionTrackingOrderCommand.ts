import { Snowflake } from '@shared/types/snowflake';

export type RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand = {
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildRoleId: Snowflake;
};
