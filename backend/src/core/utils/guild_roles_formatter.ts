import { Snowflake } from '@shared/types/snowflake';

export function formatGuildRoles(roleIds: Snowflake[]): string {
  if (roleIds.length === 0) {
    return '';
  }

  if (roleIds.length === 1) {
    return `<@&${roleIds[0]}>`;
  }

  const formattedRoles = roleIds.map((roleId) => `<@&${roleId}>`).join(', ');
  return formattedRoles;
}
