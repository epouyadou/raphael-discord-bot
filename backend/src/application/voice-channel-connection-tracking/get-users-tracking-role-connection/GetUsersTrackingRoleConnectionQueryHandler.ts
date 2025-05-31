import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { TypedResult } from '@domain/core/primitives/TypedResult';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { Inject, Injectable } from '@nestjs/common';
import {
  GetUsersTrackingRoleConnectionQuery,
  GetUserTrackingConnectionOrdersQueryResult,
} from './GetUsersTrackingRoleConnectionQuery';

@Injectable()
export class GetUsersTrackingRoleConnectionQueryHandler {
  constructor(
    @Inject(IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly roleBasedVCCTORepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  async handle(
    queryParams: GetUsersTrackingRoleConnectionQuery,
  ): Promise<TypedResult<GetUserTrackingConnectionOrdersQueryResult>> {
    const { guildId, roleId } = queryParams;

    const trackingOrders =
      await this.roleBasedVCCTORepository.findAllByTrackedTrackedRoles(
        guildId,
        [roleId],
      );

    if (!trackingOrders || trackingOrders.length === 0) {
      return TypedResult.typedSuccess({
        userIds: [],
      });
    }

    const userIds = new Set<string>();
    for (const order of trackingOrders) {
      userIds.add(order.trackerGuildMemberId);
    }

    return TypedResult.typedSuccess({
      userIds: Array.from(userIds),
    });
  }
}
