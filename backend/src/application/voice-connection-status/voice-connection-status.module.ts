import { CommunicationPlatformImplModule } from '@infrastructure/communication-platform/communication-platform-impl.module';
import { Module } from '@nestjs/common';
import { RepositoryImplModule } from '../../infrastructure/repositories/repository-impl.module';
import { GetLastRoleVoiceChannelConnectionStatusQueryHandler } from './get-last-role-voice-connection-status/GetLastRoleVoiceChannelConnectionStatusQueryHandler';
import { GetLastUserVoiceChannelConnectionStatusQueryHandler } from './get-last-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQueryHandler';
import { SaveUserVoiceChannelStatusCommandHandler } from './save-user-voice-channel-status/SaveUserVoiceChannelStatusCommandHandler';

@Module({
  imports: [RepositoryImplModule, CommunicationPlatformImplModule],
  providers: [
    SaveUserVoiceChannelStatusCommandHandler,
    GetLastUserVoiceChannelConnectionStatusQueryHandler,
    GetLastRoleVoiceChannelConnectionStatusQueryHandler,
  ],
  exports: [
    SaveUserVoiceChannelStatusCommandHandler,
    GetLastUserVoiceChannelConnectionStatusQueryHandler,
    GetLastRoleVoiceChannelConnectionStatusQueryHandler,
  ],
})
export class VoiceConnectionStatusModule {}
