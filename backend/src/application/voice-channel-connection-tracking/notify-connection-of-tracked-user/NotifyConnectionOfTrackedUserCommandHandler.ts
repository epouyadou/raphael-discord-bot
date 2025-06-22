import {
  COMMUNICATION_PLATFORM_SYMBOL,
  ICommunicationPlatform,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import {
  formatGuildChannelLink,
  formatGuildUser,
} from '@domain/core/formatters/discord_formatter';
import { TypedResult } from '@domain/core/primitives/TypedResult';
import { DisableTrackingOrderStatus } from '@domain/voice-channel-connection-tracking/DisableTrackingOrder';
import {
  DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL,
  IDisableTrackingOrderRepository,
} from '@domain/voice-channel-connection-tracking/IDisableTrackingOrderRepository';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  USER_BASED_VOICE_CHANNEL_CONNECTION_TRACKING_ORDER_REPOSITORY_SYMBOL,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { DISABLE_TRACKING_TARGET_ALL } from '../disable-tracking/DisableTrackingCommandHandler';
import { NotifyConnectionOfTrackedUserCommand } from './NotifyConnectionOfTrackedUserCommand';

@Injectable()
export class NotifyConnectionOfTrackedUserCommandHandler {
  private readonly logger: Logger = new Logger(
    NotifyConnectionOfTrackedUserCommandHandler.name,
  );

  constructor(
    @Inject(COMMUNICATION_PLATFORM_SYMBOL)
    private readonly communicationPlatform: ICommunicationPlatform,
    @Inject(
      USER_BASED_VOICE_CHANNEL_CONNECTION_TRACKING_ORDER_REPOSITORY_SYMBOL,
    )
    private readonly userBasedVCCTORepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL)
    private readonly disableTrackingOrderRepository: IDisableTrackingOrderRepository,
  ) {}

  async handle(
    command: NotifyConnectionOfTrackedUserCommand,
  ): Promise<TypedResult<Snowflake[]>> {
    const trackingOrders =
      await this.userBasedVCCTORepository.findAllByTrackedGuildMemberId(
        command.guildId,
        command.guildMemberId,
      );

    if (trackingOrders.length === 0) {
      this.logger.log(
        `No tracking orders found for guild member ${command.guildMemberId}. No notifications will be sent.`,
      );
      return TypedResult.typedSuccess([]);
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

      const shouldNotify = await this.shouldNotifyTracker(
        command.guildId,
        command.voiceChannelId,
        command.guildMemberId,
        order.trackerGuildMemberId,
      );
      if (!shouldNotify) {
        continue;
      }

      try {
        await this.communicationPlatform.sendMessageToUser({
          userId: order.trackerGuildMemberId,
          message: `User ${formatGuildUser(command.guildMemberId)} has connected to a voice channel in guild ${formatGuildChannelLink(command.guildId, command.voiceChannelId)}.`,
        });
        notifiedUsers.add(order.trackerGuildMemberId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.logger.error(
            `Failed to send notification to user ${order.trackerGuildMemberId}: ${error.message}`,
            error.stack,
          );
        } else {
          this.logger.error(
            `Failed to send notification to user ${order.trackerGuildMemberId}: Unknown error`,
            error,
          );
        }
      }
    }

    this.logger.log(
      `Sent notifications to ${notifiedUsers.size} user(s) for the connection of user ${command.guildMemberId}.`,
    );

    return TypedResult.typedSuccess(Array.from(notifiedUsers));
  }

  private async shouldNotifyTracker(
    guildId: Snowflake,
    voiceChannelId: Snowflake,
    trackedId: Snowflake,
    trackerId: Snowflake,
  ): Promise<boolean> {
    const hasAccessToTheVoiceChannel = await this.hasAccessToTheVoiceChannel(
      guildId,
      voiceChannelId,
      trackerId,
    );
    if (!hasAccessToTheVoiceChannel) {
      return false;
    }

    const isInVoiceChannel = await this.isInVoiceChannel(
      guildId,
      voiceChannelId,
      trackerId,
    );
    if (isInVoiceChannel) {
      return false;
    }

    const globalDisableTrackingStatus =
      await this.getDisabledTrackingStatusForAll(guildId, trackerId);
    if (globalDisableTrackingStatus === DisableTrackingOrderStatus.Active) {
      this.logger.log(
        `Global tracking is disabled for user ${trackerId} in guild ${guildId}. Skipping notification.`,
      );
      return false;
    } else if (DisableTrackingOrderStatus.Inactive) {
      //TODO: Delete the tracking order
    }

    const userDisableTrackingStatus =
      await this.getDisabledTrackingStatusForUser(
        guildId,
        trackerId,
        trackedId,
      );
    if (userDisableTrackingStatus === DisableTrackingOrderStatus.Active) {
      this.logger.log(
        `User tracking is disabled for user ${trackerId} in guild ${guildId} for target ${trackedId}. Skipping notification.`,
      );
      return false;
    } else if (
      userDisableTrackingStatus === DisableTrackingOrderStatus.Inactive
    ) {
      //TODO: Delete the tracking order
    }

    const userExists = await this.communicationPlatform.isUserExistInGuild(
      guildId,
      trackerId,
    );

    if (!userExists) {
      this.logger.warn(
        `User with ID ${trackerId} not found in guild ${guildId}. Skipping notification.`,
      );

      await this.userBasedVCCTORepository.deleteAllOfTracker(
        guildId,
        trackerId,
      );

      return false;
    }

    return true;
  }

  private async hasAccessToTheVoiceChannel(
    guildId: Snowflake,
    voiceChannelId: Snowflake,
    trackerId: Snowflake,
  ): Promise<boolean> {
    const hasAccessToTheVoiceChannel =
      await this.communicationPlatform.hasPermissionToAccessTheVoiceChannel(
        guildId,
        voiceChannelId,
        trackerId,
      );

    if (!hasAccessToTheVoiceChannel) {
      this.logger.log(
        `User ${trackerId} does not have permission to access the voice channel ${voiceChannelId} in guild ${guildId}. Skipping notification.`,
      );
    }

    return hasAccessToTheVoiceChannel;
  }

  private async isInVoiceChannel(
    guildId: Snowflake,
    voiceChannelId: Snowflake,
    trackerId: Snowflake,
  ) {
    const isInVoiceChannel = await this.communicationPlatform.isInVoiceChannel(
      guildId,
      voiceChannelId,
      trackerId,
    );

    if (isInVoiceChannel) {
      this.logger.log(
        `Skipping notification for user ${trackerId} as they are already in the voice channel.`,
      );
    }

    return isInVoiceChannel;
  }

  private async getDisabledTrackingStatusForAll(
    guildId: Snowflake,
    trackerId: Snowflake,
  ): Promise<DisableTrackingOrderStatus> {
    const getTrackerGlobalDisableTrackingOrder =
      await this.disableTrackingOrderRepository.find(
        guildId,
        trackerId,
        DISABLE_TRACKING_TARGET_ALL,
      );

    if (getTrackerGlobalDisableTrackingOrder.isSuccess()) {
      return getTrackerGlobalDisableTrackingOrder.value.getStatus();
    }

    return DisableTrackingOrderStatus.Undefined;
  }

  private async getDisabledTrackingStatusForUser(
    guildId: Snowflake,
    trackerId: Snowflake,
    targetId: Snowflake,
  ): Promise<DisableTrackingOrderStatus> {
    const getTrackerDisableTrackingOrder =
      await this.disableTrackingOrderRepository.find(
        guildId,
        trackerId,
        targetId,
      );

    if (getTrackerDisableTrackingOrder.isSuccess()) {
      return getTrackerDisableTrackingOrder.value.getStatus();
    }

    return DisableTrackingOrderStatus.Undefined;
  }
}
