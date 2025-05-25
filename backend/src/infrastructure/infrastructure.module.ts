import { Module } from '@nestjs/common';
import {
  RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
} from './repositories/RepositoryProviders';

@Module({
  providers: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  ],
  exports: [
    RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
    UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
  ],
})
export class InfrastructureModule {}
