import { TypedResult } from '@domain/core/primitives/TypedResult';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { Inject, Logger } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { Client } from 'discord.js';
import {
  formatGuildChannelLink,
  formatGuildUser,
} from 'src/core/utils/discord_formatter';
import { NotifyConnectionOfTrackedUserCommand } from './NotifyConnectionOfTrackedUserCommand';

export class NotifyConnectionOfTrackedUserCommandHandler {
  private readonly logger: Logger = new Logger(
    NotifyConnectionOfTrackedUserCommandHandler.name,
  );

  constructor(
    @Inject() private readonly client: Client,
    @Inject(IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly repository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  ) {}

  async handle(
    command: NotifyConnectionOfTrackedUserCommand,
  ): Promise<TypedResult<Snowflake[]>> {
    const trackingOrders = await this.repository.findAllByTrackerTrackingOrders(
      command.guildId,
      command.guildMemberId,
    );

    if (trackingOrders.length === 0) {
      this.logger.log(
        `No tracking orders found for guild member ${command.guildMemberId}. No notifications will be sent.`,
      );
      return TypedResult.typeSuccess([]);
    }

    this.logger.log(
      `Found ${trackingOrders.length} tracking orders ${command.guildMemberId}. Notifying users...`,
    );

    const notifiedUsers: Set<Snowflake> = new Set(
      command.alreadyNotifiedGuildMemberIds,
    );

    for (const order of trackingOrders) {
      if (notifiedUsers.has(order.trackerGuildMemberId)) {
        this.logger.log(
          `Skipping notification for user ${order.trackerGuildMemberId} as they have already been notified.`,
        );
        continue;
      }
      if (command.isInTheVoiceChannel(order.trackerGuildMemberId)) {
        this.logger.log(
          `Skipping notification for user ${order.trackerGuildMemberId} as they are already in the voice channel.`,
        );
        continue;
      }

      const user = await this.client.users.fetch(order.trackerGuildMemberId);
      if (!user) {
        this.logger.warn(
          `User with ID ${order.trackerGuildMemberId} not found in guild ${command.guildId}. Skipping notification.`,
        );

        await this.repository.deleteAllOfTracker(
          command.guildId,
          order.trackerGuildMemberId,
        );

        continue;
      }

      try {
        await user.send(
          `User ${formatGuildUser(command.guildMemberId)} has connected to a voice channel in guild ${formatGuildChannelLink(command.guildId, command.voiceChannelId)}.`,
        );
        notifiedUsers.add(order.trackerGuildMemberId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Failed to send notification to user ${user.id}: ${error.message}`,
            error.stack,
          );
        } else {
          this.logger.error(
            `Failed to send notification to user ${user.id}: Unknown error`,
            error,
          );
        }
      }
    }

    this.logger.log(
      `Sent notifications to ${notifiedUsers.size} user(s) for the connection of user ${command.guildMemberId}.`,
    );

    return TypedResult.typeSuccess(Array.from(notifiedUsers));
  }
}
