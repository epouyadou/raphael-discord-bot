import { Module } from '@nestjs/common';
import { DisableTrackingOrderRepositoryProvider } from './DisableTrackingOrderRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from './RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from './UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserVoiceChannelStatusRecordsRepositoryProvider } from './UserVoiceChannelStatusRecordsRepository';

@Module({
  providers: [
    DisableTrackingOrderRepositoryProvider,
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
  ],
  exports: [
    DisableTrackingOrderRepositoryProvider,
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
  ],
})
export class RepositoryImplModule {}
