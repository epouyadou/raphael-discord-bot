import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { TypedResult } from '@domain/core/primitives/TypedResult';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { Inject, Injectable } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import {
  GetUserTrackingConnectionOrdersQuery,
  GetUserTrackingConnectionOrdersQueryResult,
  TrackedRoleInformation,
  TrackedUserInformation,
  TrackerInformation,
  TrackerType,
} from './GetUserTrackingConnectionOrdersQuery';

@Injectable()
export class GetUserTrackingConnectionOrdersQueryHandler {
  constructor(
    @Inject(IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly userBasedVCCTORepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol)
    private readonly roleBasedVCCTORepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  async handle(
    queryParams: GetUserTrackingConnectionOrdersQuery,
  ): Promise<TypedResult<GetUserTrackingConnectionOrdersQueryResult>> {
    const { guildId, userId, userRoleIds } = queryParams;

    // Check if the user exists in the guild
    const isUserExistInGuild =
      await this.communicationPlatform.isUserExistInGuild(guildId, userId);
    if (!isUserExistInGuild) {
      return TypedResult.typedFailure(
        VoiceChannelConnectionTrackingOrderDomainErrors.UserNotInGuild,
      );
    }

    // Fetch the orders from the repository
    const trakersUserBasedTrackingOrders =
      await this.userBasedVCCTORepository.findAllByTrackedGuildMemberId(
        guildId,
        userId,
      );

    const trakersRoleBasedTrackingOrders =
      await this.roleBasedVCCTORepository.findAllByTrackedTrackedRoles(
        guildId,
        userRoleIds,
      );

    const trackers = Array<TrackerInformation>();
    trakersUserBasedTrackingOrders.forEach((order) => {
      if (order.trackerGuildMemberId === userId) {
        return; // Skip if the user is tracking themselves
      }
      trackers.push({
        userId: order.trackerGuildMemberId,
        trackerType: TrackerType.User,
        roleId: undefined,
      });
    });

    trakersRoleBasedTrackingOrders.forEach((order) => {
      if (order.trackerGuildMemberId === userId) {
        return; // Skip if the user is tracking themselves
      }

      trackers.push({
        userId: order.trackerGuildMemberId,
        trackerType: TrackerType.Role,
        roleId: order.trackedGuildRoleId,
      });
    });

    const userUserBasedTrackingOrders =
      await this.userBasedVCCTORepository.findAllByTrackerGuildMemberId(
        guildId,
        userId,
      );

    const userRoleBasedTrackingOrders =
      await this.roleBasedVCCTORepository.findAllByTrackerGuildMemberId(
        guildId,
        userId,
      );

    const alltrackedUsers = new Set<Snowflake>();
    const totalTrackingOrders =
      userUserBasedTrackingOrders.length + userRoleBasedTrackingOrders.length;

    const trackedUsers: Array<TrackedUserInformation> = [];
    userUserBasedTrackingOrders.map((order) => {
      alltrackedUsers.add(order.trackedGuildMemberId);
      trackedUsers.push(order.trackedGuildMemberId);
    });

    const trackedRoleIds = new Set<string>();
    userRoleBasedTrackingOrders.forEach((order) => {
      trackedRoleIds.add(order.trackedGuildRoleId);
    });

    const trackedRoleInformation: Array<TrackedRoleInformation> = [];
    for (const trackedRoleId of trackedRoleIds) {
      const userIdsHavingThisRole =
        await this.communicationPlatform.getUsersByRole(guildId, trackedRoleId);
      userIdsHavingThisRole.forEach((userId) => {
        alltrackedUsers.add(userId);
      });
      trackedRoleInformation.push({
        id: trackedRoleId,
        roleMemberCount: userIdsHavingThisRole.length,
      });
    }

    return TypedResult.typedSuccess<GetUserTrackingConnectionOrdersQueryResult>(
      {
        trackerCount: trackers.length,
        trackers: trackers,
        trackedUserCount: trackedUsers.length,
        trackedRoleCount: trackedRoleInformation.length,
        totalTrackedUsers: alltrackedUsers.size,
        totalTrackingOrders: totalTrackingOrders,
        trackedUsers: Array.from(trackedUsers),
        trackedRoles: trackedRoleInformation,
      },
    );
  }
}
