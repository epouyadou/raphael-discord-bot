import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import {
  formatGuildChannelLink,
  formatGuildRoles,
  formatGuildUser,
} from 'src/core/utils/discord_formatter';
import { NotifyConnectionOfUserWithTrackedRoleCommand } from './NotifyConnectionOfUserWithTrackedRoleCommand';

@Injectable()
export class NotifyConnectionOfUserWithTrackedRoleCommandHandler {
  private readonly logger: Logger = new Logger(
    NotifyConnectionOfUserWithTrackedRoleCommandHandler.name,
  );

  constructor(
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
    @Inject(IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly repository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  ) {}

  async handle(
    command: NotifyConnectionOfUserWithTrackedRoleCommand,
  ): Promise<void> {
    const trackingOrders = await this.repository.findAllByTrackedTrackedRoles(
      command.guildId,
      command.guildMemberRoleIds,
    );

    if (trackingOrders.length === 0) {
      this.logger.log(
        `No tracking orders found for guild roles ${formatGuildRoles(command.guildMemberRoleIds)}. No notifications will be sent.`,
      );
      return;
    }

    // Tracking orders can have the same trackerGuildMemberId, but we need to notify each user only once.
    // Therefore, we collect unique trackerGuildMemberIds.
    const guildMemberIdsToNotify = new Set<Snowflake>(
      trackingOrders.map((order) => order.trackerGuildMemberId),
    );

    this.logger.log(
      `Found ${guildMemberIdsToNotify.size} users to notify that user ${command.guildMemberId} is connected. Notifying users...`,
    );

    const notifiedUsers: Set<Snowflake> = new Set(
      command.alreadyNotifiedGuildMemberIds,
    );

    for (const guildMemberIdToNotify of guildMemberIdsToNotify) {
      if (notifiedUsers.has(guildMemberIdToNotify)) {
        this.logger.log(
          `Skipping notification for user ${guildMemberIdToNotify} as they have already been notified.`,
        );
        continue;
      }
      if (guildMemberIdToNotify === command.guildMemberId) {
        this.logger.log(
          `Skipping notification for user ${guildMemberIdToNotify} as they are the one connected.`,
        );
        continue;
      }

      const isInVoiceChannel =
        await this.communicationPlatform.isInVoiceChannel(
          command.guildId,
          command.voiceChannelId,
          guildMemberIdToNotify,
        );

      if (isInVoiceChannel) {
        this.logger.log(
          `Skipping notification for user ${guildMemberIdToNotify} as they are already in the voice channel.`,
        );
        continue;
      }

      const userExists = await this.communicationPlatform.isUserExistInGuild(
        command.guildId,
        guildMemberIdToNotify,
      );

      if (!userExists) {
        this.logger.warn(
          `User with ID ${guildMemberIdToNotify} not found in guild ${command.guildId}. Skipping notification.`,
        );

        await this.repository.deleteAllOfTracker(
          command.guildId,
          guildMemberIdToNotify,
        );

        continue;
      }

      try {
        await this.communicationPlatform.sendMessageToUser(
          guildMemberIdToNotify,
          `User ${formatGuildUser(command.guildMemberId)} has connected to a voice channel in guild ${formatGuildChannelLink(command.guildId, command.voiceChannelId)}.`,
        );
        notifiedUsers.add(guildMemberIdToNotify);
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Failed to send notification to user ${guildMemberIdToNotify}: ${error.message}`,
            error.stack,
          );
        } else {
          this.logger.error(
            `Failed to send notification to user ${guildMemberIdToNotify}: Unknown error`,
            error,
          );
        }
      }
    }

    this.logger.log(
      `Sent notifications to ${notifiedUsers.size} user(s) for the connection of user ${command.guildMemberId}.`,
    );
  }
}
