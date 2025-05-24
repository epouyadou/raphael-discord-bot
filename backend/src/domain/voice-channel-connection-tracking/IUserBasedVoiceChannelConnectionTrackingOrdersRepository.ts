import { UserBasedVoiceChannelConnectionTrackingOrder } from './UserVoiceChannelConnectionTrackingOrders';

export interface IUserBasedVoiceChannelConnectionTrackingOrdersRepository {
  findAllByTrackedGuildMemberId(
    trackedGuildMemberId: string,
  ): Promise<UserBasedVoiceChannelConnectionTrackingOrder[] | null>;

  save(
    userVoiceChannelConnectionTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder,
  ): Promise<void>;
}
