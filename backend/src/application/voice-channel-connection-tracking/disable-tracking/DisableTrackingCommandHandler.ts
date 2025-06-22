import {
  DURATION_PARSER_SYMBOL,
  IDurationParser,
} from '@application/abstractions/common/IDurationParser';
import {
  COMMUNICATION_PLATFORM_SYMBOL,
  ICommunicationPlatform,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { Result } from '@domain/core/primitives/Result';
import { DisableTrackingOrder } from '@domain/voice-channel-connection-tracking/DisableTrackingOrder';
import {
  DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL,
  IDisableTrackingOrderRepository,
} from '@domain/voice-channel-connection-tracking/IDisableTrackingOrderRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Inject, Logger } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { GuildMember, Role, User } from 'discord.js';
import { DisableTrackingCommand } from './DisableTrackingCommand';

export const DISABLE_TRACKING_TARGET_ALL = 'all';
export const INDEFINITE_DISABLE_TRACKING_DURATION = 'indefinite';

export class DisableTrackingCommandHandler {
  private readonly logger = new Logger(DisableTrackingCommandHandler.name);

  constructor(
    @Inject(DISABLE_TRACKING_ORDER_REPOSITORY_SYMBOL)
    private readonly disableTrackingOrderRepository: IDisableTrackingOrderRepository,
    @Inject(COMMUNICATION_PLATFORM_SYMBOL)
    private readonly communicationPlatform: ICommunicationPlatform,
    @Inject(DURATION_PARSER_SYMBOL)
    private readonly durationParser: IDurationParser,
  ) {}

  async handle(command: DisableTrackingCommand): Promise<Result> {
    const { guildId, userId, mentionable, duration } = command;

    if (!guildId || mentionable instanceof User) {
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.UserNotInGuild,
      );
    }

    const mentionableId: Snowflake | undefined =
      mentionable instanceof Role || mentionable instanceof GuildMember
        ? mentionable.id
        : undefined;

    let durationInMiliseconds: number | undefined = undefined;
    if (duration) {
      try {
        durationInMiliseconds = this.durationParser.parse(duration);
      } catch (error) {
        this.logger.log(
          `Failed to parse duration "${duration}": ${error instanceof Error ? error.message : String(error)}`,
        );
        return Result.failure(
          VoiceChannelConnectionTrackingOrderDomainErrors.InvalidDuration,
        );
      }
    }

    const disableTrackingorder: DisableTrackingOrder =
      DisableTrackingOrder.create({
        guildId: guildId,
        trackerId: userId,
        targetId: mentionableId,
        durationInMiliseconds: durationInMiliseconds,
      });

    try {
      await this.disableTrackingOrderRepository.save(disableTrackingorder);
    } catch {
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDisableTracking,
      );
    }

    return Result.success();
  }
}
