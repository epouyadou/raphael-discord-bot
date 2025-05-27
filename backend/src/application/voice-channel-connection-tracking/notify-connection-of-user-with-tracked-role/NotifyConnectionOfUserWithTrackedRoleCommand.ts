import { Snowflake } from 'discord.js';

export type NotifyConnectionOfUserWithTrackedRoleCommand = {
  guildId: Snowflake;
  guildMemberId: Snowflake;
  guildMemberRoleIds: Snowflake[];
  voiceChannelId: Snowflake;
  alreadyNotifiedGuildMemberIds: Snowflake[];
};
