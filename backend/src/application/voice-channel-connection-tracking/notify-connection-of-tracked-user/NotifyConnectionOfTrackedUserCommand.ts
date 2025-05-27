import { Snowflake } from 'discord.js';

export type NotifyConnectionOfTrackedUserCommand = {
  guildId: Snowflake;
  guildMemberId: Snowflake;
  voiceChannelId: Snowflake;
  alreadyNotifiedGuildMemberIds: Snowflake[];
};
