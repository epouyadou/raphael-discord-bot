import { CommonImplModule } from '@infrastructure/common/common-impl.module';
import { CommunicationPlatformImplModule } from '@infrastructure/communication-platform/communication-platform-impl.module';
import { RepositoryImplModule } from '@infrastructure/repositories/repository-impl.module';
import { Module } from '@nestjs/common';
import { DeregisterVoiceChannelConnectionTrackingCommandHandler } from './deregister-voice-channel-connection-tracking/DeregisterVoiceChannelConnectionTrackingCommandHandler';
import { GetUserTrackingConnectionOrdersQueryHandler } from './get-user-tracking-connection-orders/GetUserTrackingConnectionOrdersQueryHandler';
import { NotifyConnectionOfTrackedUserCommandHandler } from './notify-connection-of-tracked-user/NotifyConnectionOfTrackedUserCommandHandler';
import { NotifyConnectionOfUserWithTrackedRoleCommandHandler } from './notify-connection-of-user-with-tracked-role/NotifyConnectionOfUserWithTrackedRoleCommandHandler';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './register-role-based-voice-channel-connection-tracking/RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './register-user-based-voice-channel-connection-tracking/RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler';

@Module({
  imports: [
    RepositoryImplModule,
    CommonImplModule,
    CommunicationPlatformImplModule,
  ],
  providers: [
    GetUserTrackingConnectionOrdersQueryHandler,
    DeregisterVoiceChannelConnectionTrackingCommandHandler,
    NotifyConnectionOfTrackedUserCommandHandler,
    NotifyConnectionOfUserWithTrackedRoleCommandHandler,
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
  ],
  exports: [
    GetUserTrackingConnectionOrdersQueryHandler,
    DeregisterVoiceChannelConnectionTrackingCommandHandler,
    NotifyConnectionOfTrackedUserCommandHandler,
    NotifyConnectionOfUserWithTrackedRoleCommandHandler,
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
  ],
})
export class VoiceChannelConnectionTrackingModule {}
