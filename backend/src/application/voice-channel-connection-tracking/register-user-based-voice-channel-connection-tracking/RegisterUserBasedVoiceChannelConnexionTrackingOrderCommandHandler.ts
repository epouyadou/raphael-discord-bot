import { Injectable, Logger } from '@nestjs/common';
import { IDateTime } from 'src/application/abstractions/common/IDateTime';
import { Maybe } from 'src/domain/core/primitives/Maybe';
import { Result } from 'src/domain/core/primitives/Result';
import { IUserBasedVoiceChannelConnectionTrackingOrdersRepository } from 'src/domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from 'src/domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';

import { UserBasedVoiceChannelConnectionTrackingOrder } from 'src/domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrders';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand';

@Injectable()
export class RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler {
  private readonly logger = new Logger(
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler.name,
  );

  constructor(
    private readonly repository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
    private readonly dateTimeProvider: IDateTime,
  ) {}

  async handle(
    command: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand,
  ): Promise<Result> {
    const maybeUserBasedVoiceChannelConnectionTrackingOrder: Maybe<UserBasedVoiceChannelConnectionTrackingOrder> =
      await this.repository.findOneMatching(
        command.guildId,
        command.trackerGuildMemberId,
        command.trackedGuildMemberId,
      );

    if (maybeUserBasedVoiceChannelConnectionTrackingOrder.hasValue()) {
      this.logger.warn(
        `UserBasedVoiceChannelConnectionTrackingOrder already exists for guild ${command.guildId}, tracker member ${command.trackerGuildMemberId}, tracked user ${command.trackedGuildMemberId}. Skipping registration.`,
      );
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.UserAlreadyTracked,
      );
    }

    const newUserBasedVoiceChannelConnectionTrackingOrder: UserBasedVoiceChannelConnectionTrackingOrder =
      UserBasedVoiceChannelConnectionTrackingOrder.create(
        undefined, // ID will be assigned by the database
        command.guildId,
        command.trackerGuildMemberId,
        command.trackedGuildMemberId,
        this.dateTimeProvider.utcNow(),
      );

    await this.repository
      .save(newUserBasedVoiceChannelConnectionTrackingOrder)
      .catch((error: Error) => {
        this.logger.error(
          `Failed to save UserBasedVoiceChannelConnectionTrackingOrder: ${error.message}`,
          error.stack,
        );
        return Result.failure(
          VoiceChannelConnectionTrackingOrderDomainErrors.FailedToRegister,
        );
      });

    this.logger.log(
      `Registered new UserBasedVoiceChannelConnectionTrackingOrder for guild ${command.guildId}, tracker member ${command.trackerGuildMemberId}, tracked user ${command.trackedGuildMemberId}`,
    );

    return Result.success();
  }
}
