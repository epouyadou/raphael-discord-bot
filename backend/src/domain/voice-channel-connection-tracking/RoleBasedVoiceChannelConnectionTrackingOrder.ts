import { Snowflake } from '../../shared/types/snowflake';
import { Ensure } from '../core/guards/Ensure';

export class RoleBasedVoiceChannelConnectionTrackingOrder {
  id: number | undefined;
  guildId: Snowflake;
  trackerId: Snowflake;
  trackedGuildRoleId: Snowflake;
  createdAt: Date;

  private constructor(
    id: number | undefined,
    guildId: Snowflake,
    trackerId: Snowflake,
    trackedGuildRoleId: Snowflake,
    createdAt: Date,
  ) {
    this.id = id;
    this.guildId = guildId;
    this.trackerId = trackerId;
    this.trackedGuildRoleId = trackedGuildRoleId;
    this.createdAt = createdAt;
  }

  static create(
    guildId: string,
    trackerId: string,
    trackedGuildRoleId: string,
    createdAt: Date,
  ): RoleBasedVoiceChannelConnectionTrackingOrder {
    Ensure.notEmpty(guildId, 'Guild ID cannot be empty', 'guildId');
    Ensure.notEmpty(trackerId, 'Tracker ID cannot be empty', 'trackerId');
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
      undefined,
      guildId,
      trackerId,
      trackedGuildRoleId,
      createdAt,
    );
  }
}
