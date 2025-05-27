import { Module } from '@nestjs/common';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from './RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from './UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserVoiceChannelStatusRecordsRepositoryProvider } from './UserVoiceChannelStatusRecordsRepository';

@Module({
  providers: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
  ],
  exports: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserVoiceChannelStatusRecordsRepositoryProvider,
  ],
})
export class RepositoryImplModule {}
