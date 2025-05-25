import { Module } from '@nestjs/common';
import { IDateTimeProvider } from './common/MachineTime';
import {
  RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
} from './repositories/RepositoryProviders';

@Module({
  providers: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    IDateTimeProvider,
  ],
  exports: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    IDateTimeProvider,
  ],
})
export class InfrastructureModule {}
