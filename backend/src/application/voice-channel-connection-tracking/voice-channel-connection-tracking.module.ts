import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { DeregisterVoiceChannelConnectionTrackingCommandHandler } from './deregister-voice-channel-connection-tracking/DeregisterVoiceChannelConnectionTrackingCommandHandler';
import { NotifyConnectionOfTrackedUserCommandHandler } from './notify-connection-of-tracked-user/NotifyConnectionOfTrackedUserCommandHandler';
import { NotifyConnectionOfUserWithTrackedRoleCommandHandler } from './notify-connection-of-user-with-tracked-role/NotifyConnectionOfUserWithTrackedRoleCommandHandler';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './register-role-based-voice-channel-connection-tracking/RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './register-user-based-voice-channel-connection-tracking/RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler';

@Module({
  imports: [InfrastructureModule],
  providers: [
    DeregisterVoiceChannelConnectionTrackingCommandHandler,
    NotifyConnectionOfTrackedUserCommandHandler,
    NotifyConnectionOfUserWithTrackedRoleCommandHandler,
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
  ],
  exports: [
    DeregisterVoiceChannelConnectionTrackingCommandHandler,
    NotifyConnectionOfTrackedUserCommandHandler,
    NotifyConnectionOfUserWithTrackedRoleCommandHandler,
    RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
    RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
  ],
})
export class VoiceChannelConnectionTrackingModule {}
