import { BotError } from '../core/primitives/BotError';

export class VoiceChannelConnectionTrackingOrderDomainErrors {
  static readonly RoleAlreadyTracked = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.RoleAlreadyTracked',
    'You are already tracking this Role.',
  );

  static readonly UserAlreadyTracked = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.UserAlreadyTracked',
    'You are already tracking this User.',
  );

  static readonly FailedToRegister = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.FailedToRegister',
    'Failed to register the voice channel connection tracking order. Please try again later. If the problem persists, contact support.',
  );
}
