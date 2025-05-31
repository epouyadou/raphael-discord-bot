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

  static readonly FailedToDeregister = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDeregister',
    'Failed to deregister the voice channel connection tracking order. Please try again later. If the problem persists, contact support.',
  );
  static readonly NotFound = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.NotFound',
    'The voice channel connection tracking order was not found. It may have already been deleted or never existed.',
  );

  static readonly UserNotInGuild = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.UserNotInGuild',
    'The mentioned user is not in the guild. Are you sure they are a member of this server?',
  );
}
