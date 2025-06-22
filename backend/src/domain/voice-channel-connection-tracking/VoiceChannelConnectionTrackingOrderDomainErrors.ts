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

  static readonly FailedToDisableTracking = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDisableTracking',
    'Failed to disable tracking. Please try again later. If the problem persists, contact support.',
  );
  static readonly InvalidDuration = new BotError(
    'VoiceChannelConnectionTrackingOrderDomainErrors.InvalidDuration',
    'The provided duration is invalid. Please provide a valid duration in the format "1h", "30m", "15s", etc. (available units: s = second, m = minute, h = hour, d = day, w = week, M = month, Y = year). ) If you want to disable tracking indefinitely do not provide a duration.',
  );
}
