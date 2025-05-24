import { Inject, Logger } from '@nestjs/common';
import { Client } from 'discord.js';
import { Context, ContextOf, On } from 'necord';
import { PostgresPool } from 'src/core/postgres/postgres';
import { NotifyMeOnVoiceChannelConnectionService } from './NotifyMeOnVoiceChannelConnection.service';
import { UserTrackingOrder } from './types';

export class NotifyMeOnVoiceChannelConnectionListeners {
  private readonly logger = new Logger(
    NotifyMeOnVoiceChannelConnectionListeners.name,
  );

  constructor(
    @Inject()
    private notifyMeOnVoiceChannelConnectionService: NotifyMeOnVoiceChannelConnectionService,
    private client: Client,
    private postgres: PostgresPool,
  ) {}

  @On('voiceChannelJoin')
  async onVoiceChannelJoin(
    @Context() [member, voiceChannel]: ContextOf<'voiceChannelJoin'>,
  ) {
    // TODO: Implement the logic to notify the user when someone connects to the voice channel
    // When a user connects to a voice channel, check if they are being tracked (id or role)
    // If they are, send a message to the users who are tracking them
    // If the user is not being tracked, do nothing

    this.logger.log(
      `User ${member.id} joined voice channel ${voiceChannel.id}`,
    );

    // Register the event in the database
    await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
      member.id,
      voiceChannel.guildId,
      null,
      voiceChannel.id,
    );

    // Check if the user is being tracked
    const findUsersTrackingMemberQuery = `
      SELECT user_id FROM raphaeldb.user_tracking_orders 
      WHERE guild_Id = $1 AND guild_member_id = $2`;
    const findUsersTrackingMemberQueryResult = await this.postgres.query(
      findUsersTrackingMemberQuery,
      [voiceChannel.guildId, member.id],
    );

    const findUserTrackingMemberRoleQuery = `
      SELECT user_id FROM raphaeldb.role_tracking_orders
      WHERE guild_Id = $1 AND guild_role_id = $2`;
    const findUserTrackingMemberRoleQueryResult = await this.postgres.query(
      findUserTrackingMemberRoleQuery,
      [voiceChannel.guildId, member.id],
    );

    const userIds = Array<string>();

    if (
      findUsersTrackingMemberQueryResult.rowCount &&
      findUsersTrackingMemberQueryResult.rowCount > 0
    ) {
      // Notify the user
      findUsersTrackingMemberQueryResult.rows.map((row: UserTrackingOrder) =>
        userIds.push(row.user_id),
      );
    }

    if (
      findUserTrackingMemberRoleQueryResult.rowCount &&
      findUserTrackingMemberRoleQueryResult.rowCount > 0
    ) {
      // Notify the user
      findUserTrackingMemberRoleQueryResult.rows.map((row: UserTrackingOrder) =>
        userIds.push(row.user_id),
      );
    }

    const guild = await this.client.guilds
      .fetch(voiceChannel.guildId)
      .catch((error) => {
        this.logger.error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Failed to fetch guild ${voiceChannel.guildId}: ${error.message}`,
        );
        return null;
      });

    if (!guild) {
      return;
    }

    let notifiedUsersCount = 0;

    for (const userId of userIds) {
      if (voiceChannel.members.has(userId)) {
        this.logger.log(
          `User ${userId} is already in voice channel ${voiceChannel.id}, skipping notification.`,
        );
        continue;
      }

      const member = await guild.members.fetch(userId).catch((error) => {
        this.logger.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `User ${userId} not found in guild ${voiceChannel.guildId}: ${error.message}`,
        );
        return null;
      });

      if (!member) {
        continue;
      }

      await member
        .send(
          `User <@${member.id}> joined voice channel https://discord.com/channels/${voiceChannel.guildId}/${voiceChannel.id}`,
        )
        .catch((error) => {
          this.logger.error(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Failed to send message to user ${userId} in guild ${voiceChannel.guildId}: ${error.message}`,
          );
        });

      notifiedUsersCount++;
    }

    if (notifiedUsersCount > 0) {
      this.logger.log(
        `Notified ${notifiedUsersCount} user(s) that user ${member.user.username} joined voice channel ${voiceChannel.name}`,
      );
    }
  }

  @On('voiceChannelLeave')
  async onVoiceChannelLeave(
    @Context() [member, voiceChannel]: ContextOf<'voiceChannelLeave'>,
  ) {
    this.logger.log(
      `User ${member.id} leaved voice channel ${voiceChannel.id}`,
    );

    // Register the event in the database
    await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
      member.id,
      voiceChannel.guildId,
      voiceChannel.id,
      null,
    );
  }

  @On('voiceChannelSwitch')
  async onVoiceChannelSwitch(
    @Context()
    [member, fromChannel, toChannel]: ContextOf<'voiceChannelSwitch'>,
  ) {
    this.logger.log(
      `User ${member.id} switched from voice channel ${fromChannel.id} to ${toChannel.id}`,
    );

    // Register the event in the database
    await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
      member.id,
      fromChannel.guildId,
      fromChannel.id,
      toChannel.id,
    );
  }
}
