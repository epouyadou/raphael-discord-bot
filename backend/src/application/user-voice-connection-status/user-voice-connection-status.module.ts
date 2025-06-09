import { CommunicationPlatformImplModule } from '@infrastructure/communication-platform/communication-platform-impl.module';
import { Module } from '@nestjs/common';
import { RepositoryImplModule } from './../../infrastructure/repositories/repository-impl.module';
import { GetLastUserVoiceChannelConnectionStatusQueryHandler } from './get-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQueryHandler';
import { SaveUserVoiceChannelStatusCommandHandler } from './save-user-voice-channel-status/SaveUserVoiceChannelStatusCommandHandler';

@Module({
  imports: [RepositoryImplModule, CommunicationPlatformImplModule],
  providers: [
    SaveUserVoiceChannelStatusCommandHandler,
    GetLastUserVoiceChannelConnectionStatusQueryHandler,
  ],
  exports: [
    SaveUserVoiceChannelStatusCommandHandler,
    GetLastUserVoiceChannelConnectionStatusQueryHandler,
  ],
})
export class UserVoiceConnectionStatusModule {}
