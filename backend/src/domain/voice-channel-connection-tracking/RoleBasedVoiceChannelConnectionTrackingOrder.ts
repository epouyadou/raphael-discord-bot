import { Snowflake } from '@shared/types/snowflake';
import { Ensure } from '../core/guards/Ensure';

export class RoleBasedVoiceChannelConnectionTrackingOrder {
  id: number | undefined;
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
  trackedGuildRoleId: Snowflake;
  createdAt: Date;

  private constructor(
    id: number | undefined,
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
    createdAt: Date,
  ) {
    this.id = id;
    this.guildId = guildId;
    this.trackerGuildMemberId = trackerGuildMemberId;
    this.trackedGuildRoleId = trackedGuildRoleId;
    this.createdAt = createdAt;
  }

  static create(
    id: number | undefined,
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildRoleId: Snowflake,
    createdAt: Date,
  ): RoleBasedVoiceChannelConnectionTrackingOrder {
    Ensure.notEmpty(guildId, 'Guild ID cannot be empty', 'guildId');
    Ensure.notEmpty(
      trackerGuildMemberId,
      'Tracker Guild Member ID cannot be empty',
      'trackerGuildMemberId',
    );
    Ensure.notEmpty(
      trackedGuildRoleId,
      'Tracked Guild Role ID cannot be empty',
      'trackedGuildRoleId',
    );
    Ensure.notNullOrUndefined(
      createdAt,
      'Created At cannot be null or undefined',
      'createdAt',
    );

    return new RoleBasedVoiceChannelConnectionTrackingOrder(
      id,
      guildId,
      trackerGuildMemberId,
      trackedGuildRoleId,
      createdAt,
    );
  }
}
