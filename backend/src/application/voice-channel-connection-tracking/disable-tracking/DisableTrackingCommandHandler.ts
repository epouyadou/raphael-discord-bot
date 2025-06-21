import { ICommunicationPlatform } from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { Result } from '@domain/core/primitives/Result';
import { IDisableTrackingOrderRepository } from '@domain/voice-channel-connection-tracking/IDisableTrackingOrderRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Snowflake } from '@shared/types/snowflake';
import { GuildMember, Role, User } from 'discord.js';
import { DisableTrackingCommand } from './DisableTrackingCommand';

const ALL_TRACKING_ORDER = 'all';
const INDEFINITE_DURATION = 'indefinite';

export class DisableTrackingCommandHandler {
  constructor(
    private readonly disableTrackingOrderRepository: IDisableTrackingOrderRepository,
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  async handle(command: DisableTrackingCommand): Promise<Result> {
    const { guildId, userId, mentionable, duration } = command;

    if (!guildId || mentionable instanceof User) {
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.UserNotInGuild,
      );
    }

    let mentionableId: Snowflake | undefined;

    if (mentionable instanceof Role || mentionable instanceof GuildMember) {
      mentionableId = mentionable.id;
    }

    try {
      await this.disableTrackingOrderRepository.save(
        guildId,
        userId,
        mentionableId || ALL_TRACKING_ORDER,
        duration || INDEFINITE_DURATION,
      );
    } catch {
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDisableTracking,
      );
    }

    return Result.success();
  }
}
