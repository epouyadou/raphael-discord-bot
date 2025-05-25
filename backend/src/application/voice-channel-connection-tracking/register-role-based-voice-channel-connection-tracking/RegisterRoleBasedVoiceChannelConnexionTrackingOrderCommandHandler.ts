import {
  IDateTime,
  IDateTimeSymbol,
} from '@application/abstractions/common/IDateTime';
import { Result } from '@domain/core/primitives/Result';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand';

@Injectable()
export class RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler {
  private readonly logger = new Logger(
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler.name,
  );

  constructor(
    @Inject(IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly repository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(IDateTimeSymbol)
    private readonly dateTimeProvider: IDateTime,
  ) {}

  async handle(
    command: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand,
  ): Promise<Result> {
    const isAlreadyTracked: boolean = await this.repository.exist(
      command.guildId,
      command.trackerGuildMemberId,
      command.trackedGuildRoleId,
    );

    if (isAlreadyTracked) {
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
