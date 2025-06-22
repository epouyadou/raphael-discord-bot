import {
    DATE_TIME_SYMBOL,
    IDateTime,
} from '@application/abstractions/common/IDateTime';
import { Result } from '@domain/core/primitives/Result';
import {
    IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
    USER_BASED_VOICE_CHANNEL_CONNECTION_TRACKING_ORDER_REPOSITORY_SYMBOL,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { UserBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrder';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand';

@Injectable()
export class RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler {
  private readonly logger = new Logger(
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler.name,
  );

  constructor(
    @Inject(USER_BASED_VOICE_CHANNEL_CONNECTION_TRACKING_ORDER_REPOSITORY_SYMBOL)
    private readonly repository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(DATE_TIME_SYMBOL)
    private readonly dateTimeProvider: IDateTime,
  ) {}

  async handle(
    command: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand,
  ): Promise<Result> {
    const isAlreadyTracked: boolean = await this.repository.exists(
      command.guildId,
      command.trackerGuildMemberId,
      command.trackedGuildMemberId,
    );

    if (isAlreadyTracked) {
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
