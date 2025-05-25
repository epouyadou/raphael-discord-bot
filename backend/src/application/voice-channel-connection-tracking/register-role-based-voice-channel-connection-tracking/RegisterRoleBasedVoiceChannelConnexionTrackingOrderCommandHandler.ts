import { Injectable, Logger } from '@nestjs/common';
import { IDateTime } from 'src/application/abstractions/common/IDateTime';
import { Maybe } from 'src/domain/core/primitives/Maybe';
import { Result } from 'src/domain/core/primitives/Result';
import { IRoleBasedVoiceChannelConnectionTrackingOrdersRepository } from 'src/domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from 'src/domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from 'src/domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand';

@Injectable()
export class RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler {
  private readonly logger = new Logger(
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler.name,
  );

  constructor(
    private readonly repository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
    private readonly dateTimeProvider: IDateTime,
  ) {}

  async handle(
    command: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand,
  ): Promise<Result> {
    const maybeRoleBasedVoiceChannelConnectionTrackingOrder: Maybe<RoleBasedVoiceChannelConnectionTrackingOrder> =
      await this.repository.findOneMatching(
        command.guildId,
        command.trackerGuildMemberId,
        command.trackedGuildRoleId,
      );

    if (maybeRoleBasedVoiceChannelConnectionTrackingOrder.hasValue()) {
      return Result.failure(
        VoiceChannelConnectionTrackingOrderDomainErrors.RoleAlreadyTracked,
      );
    }

    const newRoleBasedVoiceChannelConnectionTrackingOrder: RoleBasedVoiceChannelConnectionTrackingOrder =
      RoleBasedVoiceChannelConnectionTrackingOrder.create(
        undefined, // ID will be assigned by the database
        command.guildId,
        command.trackerGuildMemberId,
        command.trackedGuildRoleId,
        this.dateTimeProvider.utcNow(),
      );

    await this.repository
      .save(newRoleBasedVoiceChannelConnectionTrackingOrder)
      .catch((error: Error) => {
        this.logger.error(
          `Failed to save RoleBasedVoiceChannelConnectionTrackingOrder: ${error.message}`,
          error.stack,
        );
        return Result.failure(
          VoiceChannelConnectionTrackingOrderDomainErrors.FailedToRegister,
        );
      });

    this.logger.log(
      `Registered new RoleBasedVoiceChannelConnectionTrackingOrder for guild ${command.guildId}, tracker member ${command.trackerGuildMemberId}, tracked role ${command.trackedGuildRoleId}`,
    );

    return Result.success();
  }
}
