import { Snowflake } from '@shared/types/snowflake';

export type GetUsersTrackingRoleConnectionQuery = {
  guildId: string;
  roleId: string;
};

export type GetUserTrackingConnectionOrdersQueryResult = {
  userIds: Snowflake[];
};
