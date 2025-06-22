import { Ensure } from '@domain/core/guards/Ensure';
import { Snowflake } from '@shared/types/snowflake';

export const ALL_TRACKING_ORDER: string = 'all';
export const INDEFINITE_DISABLE_TRACKING_DURATION: string = 'indefinite';

export type ReenbleingDateTime = Date | string;

export enum DisableTrackingOrderStatus {
  Active = 'active',
  Inactive = 'inactive',
  Undefined = 'undefined',
}

export class DisableTrackingOrder {
  guildId: Snowflake;
  trackerId: Snowflake;
  target: string;
  reenbleingDateTime: ReenbleingDateTime;

  private constructor(
    guildId: Snowflake,
    trackerId: Snowflake,
    target: string,
    reenbleingDateTime: ReenbleingDateTime,
  ) {
    this.guildId = guildId;
    this.trackerId = trackerId;
    this.target = target;
    this.reenbleingDateTime = reenbleingDateTime;
  }

  static create(params: {
    guildId: string;
    trackerId: string;
    targetId?: Snowflake;
    durationInMiliseconds?: number;
    reenbleingDateTime?: ReenbleingDateTime;
  }): DisableTrackingOrder {
    Ensure.notEmpty(params.guildId, 'Guild ID must not be empty', 'guildId');
    Ensure.notEmpty(
      params.trackerId,
      'Tracker ID must not be empty',
      'trackerId',
    );

    if (params.reenbleingDateTime && params.durationInMiliseconds) {
      throw new Error(
        'Either reenablingDateTime or durationInMiliseconds should be provided, not both.',
      );
    }

    const target: string = params.targetId
      ? params.targetId
      : ALL_TRACKING_ORDER;

    let computedReenablingDateTime: ReenbleingDateTime =
      INDEFINITE_DISABLE_TRACKING_DURATION;

    if (params.reenbleingDateTime) {
      computedReenablingDateTime = params.reenbleingDateTime;
    } else if (params.durationInMiliseconds) {
      computedReenablingDateTime = new Date(
        Date.now() + params.durationInMiliseconds,
      );
    }

    return new DisableTrackingOrder(
      params.guildId,
      params.trackerId,
      target,
      computedReenablingDateTime,
    );
  }

  getStatus(): DisableTrackingOrderStatus {
    if (this.reenbleingDateTime === INDEFINITE_DISABLE_TRACKING_DURATION) {
      return DisableTrackingOrderStatus.Active;
    }

    const currentDate = new Date();
    if (this.reenbleingDateTime instanceof Date) {
      return this.reenbleingDateTime > currentDate
        ? DisableTrackingOrderStatus.Active
        : DisableTrackingOrderStatus.Inactive;
    }

    throw new Error(
      'ReenbleingDateTime must be a Date instance or "indefinite".',
    );
  }
}
