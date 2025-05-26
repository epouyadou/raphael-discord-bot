import { Result } from '@domain/core/primitives/Result';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Inject, Logger } from '@nestjs/common';
import { DeregisterVoiceChannelConnectionTrackingCommand } from './DeregisterVoiceChannelConnectionTrackingCommand';

export class DeregisterVoiceChannelConnectionTrackingCommandHandler {
  private readonly logger: Logger = new Logger(
    DeregisterVoiceChannelConnectionTrackingCommandHandler.name,
  );

  constructor(
    @Inject(IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly roleBasedVCCTRepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly userBasedVCCTRepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  ) {}

  async handle(
    command: DeregisterVoiceChannelConnectionTrackingCommand,
  ): Promise<Result> {
    let hasBeenDeregistered = false;

    try {
      if (command.isRoleBased) {
        hasBeenDeregistered = await this.roleBasedVCCTRepository.delete(
          command.guildId,
          command.trackerGuildMemberId,
          command.mentionableId,
        );

        this.logger.log(
          `Deleted role connection tracking for guild of role ${command.mentionableId}, by tracker ${command.trackerGuildMemberId} in guild ${command.guildId}`,
        );
      }

      if (command.isUserBased) {
        hasBeenDeregistered = await this.userBasedVCCTRepository.delete(
          command.guildId,
          command.trackerGuildMemberId,
          command.mentionableId,
        );

        this.logger.log(
          `Deleted user connection tracking for guild of user ${command.mentionableId}, by tracker ${command.trackerGuildMemberId} in guild ${command.guildId}`,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to deregister voice channel connection tracking: ${error.message}`,
          error.stack,
        );
      }
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDeregister,
      );
    }

    if (!hasBeenDeregistered) {
      this.logger.warn(
        `No voice channel connection tracking order found to deregister for guild ${command.guildId}, tracker ${command.trackerGuildMemberId}, mentionable ${command.mentionableId}`,
      );
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.NotFound,
      );
    }

    return Result.success();
  }
}
