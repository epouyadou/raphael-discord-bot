import { Snowflake } from '@shared/types/snowflake';
import { Ensure } from '../core/guards/Ensure';

export class VoiceChannelStatusRecord {
  id: string | undefined;
  guildId: Snowflake;
  guildMemberId: Snowflake;
  fromVoiceChannelId: Snowflake | null;
  toVoiceChannelId: Snowflake | null;
  createdAt: Date;

  private constructor(
    id: string | undefined,
    guildId: Snowflake,
    guildMemberId: Snowflake,
    fromVoiceChannelId: Snowflake | null,
    toVoiceChannelId: Snowflake | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.guildId = guildId;
    this.guildMemberId = guildMemberId;
    this.fromVoiceChannelId = fromVoiceChannelId;
    this.toVoiceChannelId = toVoiceChannelId;
    this.createdAt = createdAt;
  }

  static create(
    id: string | undefined,
    guildId: Snowflake,
    guildMemberId: Snowflake,
    fromVoiceChannelId: Snowflake | null,
    toVoiceChannelId: Snowflake | null,
    createdAt: Date,
  ): VoiceChannelStatusRecord {
    Ensure.notEmpty(guildId, 'Guild ID cannot be empty', 'guildId');
    Ensure.notEmpty(
      guildMemberId,
      'Guild Member ID cannot be empty',
      'guildMemberId',
    );
    Ensure.notNullOrUndefined(
      createdAt,
      'Created At cannot be null or undefined',
      'createdAt',
    );

    return new VoiceChannelStatusRecord(
      id,
      guildId,
      guildMemberId,
      fromVoiceChannelId,
      toVoiceChannelId,
      createdAt,
    );
  }
}
