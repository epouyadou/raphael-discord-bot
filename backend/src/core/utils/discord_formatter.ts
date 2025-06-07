import { Snowflake } from '@shared/types/snowflake';

export function formatGuildRole(roleId: Snowflake): string {
  return `<@&${roleId}>`;
}

export function formatGuildRoles(roleIds: Snowflake[]): string {
  if (roleIds.length === 0) {
    return '';
  }

  if (roleIds.length === 1) {
    return formatGuildRole(roleIds[0]);
  }

  const formattedRoles = roleIds.map((roleId) => `<@&${roleId}>`).join(', ');
  return formattedRoles;
}

export function formatGuildUser(userId: Snowflake): string {
  return `<@${userId}>`;
}

export function formatGuildUsers(userIds: Snowflake[]): string {
  if (userIds.length === 0) {
    return '';
  }

  if (userIds.length === 1) {
    return formatGuildUser(userIds[0]);
  }

  const formattedUsers = userIds.map((userId) => `<@${userId}>`).join(', ');
  return formattedUsers;
}

export function formatGuildChannelLink(
  guildId: Snowflake,
  channelId: Snowflake,
): string {
  return `https://discord.com/channels/${guildId}/${channelId}`;
}
