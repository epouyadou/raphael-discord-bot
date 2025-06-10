import { Snowflake } from '@shared/types/snowflake';

export type SaveUserVoiceChannelStatusCommand = {
  guildId: Snowflake;
  guildMemberId: Snowflake;
  fromChannelId: Snowflake | null; // The channel the user was in before, null if they were not in a channel
  toChannelId: Snowflake | null; // The channel the user is in now, null if they are not in a channel
};
