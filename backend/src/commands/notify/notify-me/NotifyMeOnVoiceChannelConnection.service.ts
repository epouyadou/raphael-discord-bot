import { Injectable, Logger } from '@nestjs/common';
import { PostgresPool } from 'src/core/postgres/postgres';

@Injectable()
export class NotifyMeOnVoiceChannelConnectionService {
  private readonly logger = new Logger(
    NotifyMeOnVoiceChannelConnectionService.name,
  );

  constructor(private postgres: PostgresPool) {}

  async trackUser(userId: string, member_id: string, guildId: string) {
    this.logger.log(`Tracking user ${userId} in guild ${guildId}`);
    const query = `
        INSERT INTO raphaeldb.user_tracking_orders (user_id, guild_id, guild_member_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING`;
    await this.postgres.query(query, [userId, guildId, member_id]);
  }

  async trackRole(userId: string, roleId: string, guildId: string) {
    this.logger.log(`Tracking role ${roleId} in guild ${guildId}`);
    const query = `
        INSERT INTO raphaeldb.role_tracking_orders (user_id, guild_Id, guild_role_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING`;
    await this.postgres.query(query, [userId, guildId, roleId]);
  }

  async registerVoiceChannelStatus(
    memberId: string,
    guildId: string,
    fromChannelId: string | null,
    toChannelId: string | null,
  ) {
    if (!fromChannelId && !toChannelId) {
      return;
    }

    const registerEventQuery = `
      INSERT INTO raphaeldb.voice_channel_status_records (guild_member_id, guild_id, from_guild_channel_id, to_guild_channel_id)
      VALUES ($1, $2, $3, $4)`;
    await this.postgres.query(registerEventQuery, [
      memberId,
      guildId,
      fromChannelId,
      toChannelId,
    ]);
  }
}
