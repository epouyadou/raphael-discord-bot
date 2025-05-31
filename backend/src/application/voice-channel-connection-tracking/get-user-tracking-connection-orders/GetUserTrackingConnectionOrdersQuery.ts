import { Snowflake } from '@shared/types/snowflake';

export type GetUserTrackingConnectionOrdersQuery = {
  guildId: Snowflake;
  userId: Snowflake;
  userRoleIds: Snowflake[];
};

export type GetUserTrackingConnectionOrdersQueryResult = {
  /**
   * The number of trackers tracking this user.
   * It is used to determine how many trackers are tracking this user.
   */
  trackerCount: number;

  /**
   * The list of trackers tracking this user.
   * It contains information about the trackers, including their user ID and
   * by which mean they are tracking the user (directly or by role).
   */
  trackers: TrackerInformation[];

  /**
   * The number of users tracked by this user.
   * It is used to determine how many users this user is tracking.
   * It includes only users tracked directly.
   */
  trackedUserCount: number;

  /**
   * The number of role tracked by this user.
   * It contains the IDs of the users that this user is tracking.
   */
  trackedRoleCount: number;

  /**
   * The number of users tracked by this user.
   * It is used to determine how many users this user is tracking.
   * It includes both users tracked directly and by role.
   */
  totalTrackedUsers: number;

  /**
   * The number of tracking orders of this user.
   * It is used to determine how many tracking orders this user has.
   * It includes both user-based and role-based tracking orders.
   */
  totalTrackingOrders: number;

  trackedUsers: TrackedUserInformation[];
  trackedRoles: TrackedRoleInformation[];
};

export type TrackerInformation = {
  userId: Snowflake;
  trackerType: TrackerType;
  roleId?: Snowflake;
};

export enum TrackerType {
  User = 'user',
  Role = 'role',
}

export type TrackedUserInformation = Snowflake;

export type TrackedRoleInformation = {
  id: Snowflake;
  roleMemberCount: number;
};
