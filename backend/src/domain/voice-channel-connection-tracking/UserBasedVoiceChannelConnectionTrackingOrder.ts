import { Snowflake } from '../../shared/types/snowflake';
import { Ensure } from '../core/guards/Ensure';

export class UserBasedVoiceChannelConnectionTrackingOrder {
  id: number | undefined;
  guildId: Snowflake;
  trackerGuildMemberId: Snowflake;
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
    this.trackerGuildMemberId = trackerId;
    this.trackedGuildMemberId = trackedGuildMemberId;
    this.createdAt = createdAt;
  }

  static create(
    id: number | undefined,
    guildId: Snowflake,
    trackerGuildMemberId: Snowflake,
    trackedGuildMemberId: Snowflake,
    createdAt: Date,
  ): UserBasedVoiceChannelConnectionTrackingOrder {
    Ensure.notEmpty(guildId, 'Guild ID cannot be empty', 'guildId');
    Ensure.notEmpty(
      trackerGuildMemberId,
      'Tracker Guild Member ID cannot be empty',
      'trackerGuildMemberId',
    );
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
      id,
      guildId,
      trackerGuildMemberId,
      trackedGuildMemberId,
      createdAt,
    );
  }
}
