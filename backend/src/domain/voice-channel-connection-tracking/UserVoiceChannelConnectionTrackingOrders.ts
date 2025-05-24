import { Snowflake } from '../../shared/types/snowflake';
import { Ensure } from '../core/guards/Ensure';

export class UserBasedVoiceChannelConnectionTrackingOrder {
  id: number | undefined;
  guildId: Snowflake;
  trackerId: Snowflake;
  trackedGuildMemberId: Snowflake;
  createdAt: Date;

  private constructor(
    id: number | undefined,
    guildId: Snowflake,
    trackerId: Snowflake,
    trackedGuildMemberId: Snowflake,
    createdAt: Date,
  ) {
    this.id = id;
    this.guildId = guildId;
    this.trackerId = trackerId;
    this.trackedGuildMemberId = trackedGuildMemberId;
    this.createdAt = createdAt;
  }

  static create(
    guildId: string,
    trackerId: string,
    trackedGuildMemberId: string,
    createdAt: Date,
  ): UserBasedVoiceChannelConnectionTrackingOrder {
    Ensure.notEmpty(guildId, 'Guild ID cannot be empty', 'guildId');
    Ensure.notEmpty(trackerId, 'Tracker ID cannot be empty', 'trackerId');
    Ensure.notEmpty(
      trackedGuildMemberId,
      'Tracked Guild Member ID cannot be empty',
      'trackedGuildMemberId',
    );
    Ensure.notNullOrUndefined(
      createdAt,
      'Created At cannot be null or undefined',
      'createdAt',
    );

    return new UserBasedVoiceChannelConnectionTrackingOrder(
      undefined,
      guildId,
      trackerId,
      trackedGuildMemberId,
      createdAt,
    );
  }
}
