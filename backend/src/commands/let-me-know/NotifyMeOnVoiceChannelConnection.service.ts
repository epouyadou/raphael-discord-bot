import { Injectable, Logger } from '@nestjs/common';
import { On } from 'necord';
import { PostgresPool } from 'src/core/postgres/postgres';

@Injectable()
export class NotifyMeOnVoiceChannelConnectionService {
  private readonly logger = new Logger(
    NotifyMeOnVoiceChannelConnectionService.name,
  );

  constructor(private postgres: PostgresPool) {}

  async trackUser(userId: string, member_id, channelId: string) {
    this.logger.log(`Tracking user ${userId} in channel ${channelId}`);
    const query = `
        INSERT INTO user_trackings (user_id, guild_member_id, guild_channel_id) 
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING`;
    await this.postgres.query(query, [userId, member_id, channelId]);
  }

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(oldState, newState) {
    // TODO: Implement the logic to notify the user when someone connects to the voice channel
  }
}
