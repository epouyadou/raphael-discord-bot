import { Module } from '@nestjs/common';
import { IDateTimeProvider } from './common/MachineTime';
import {
  RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  UserVoiceChannelStatusRecordsRepositoryProvider,
} from './repositories/RepositoryProviders';

@Module({
  providers: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
    IDateTimeProvider,
  ],
  exports: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
    IDateTimeProvider,
  ],
})
export class InfrastructureModule {}
