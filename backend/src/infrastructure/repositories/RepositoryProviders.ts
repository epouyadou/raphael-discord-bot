import { IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol } from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol } from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { IUserVoiceChannelStatusRecordsRepositorySymbol } from '@domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepository } from './RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepository } from './UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserVoiceChannelStatusRecordsRepository } from './UserVoiceChannelStatusRecordsRepository';

export const RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider = {
  provide: IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
  useClass: RoleBasedVoiceChannelConnectionTrackingOrdersRepository,
};

export const UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider = {
  provide: IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
  useClass: UserBasedVoiceChannelConnectionTrackingOrdersRepository,
};

export const UserVoiceChannelStatusRecordsRepositoryProvider = {
  provide: IUserVoiceChannelStatusRecordsRepositorySymbol,
  useClass: UserVoiceChannelStatusRecordsRepository,
};
