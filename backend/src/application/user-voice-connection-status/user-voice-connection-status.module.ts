import { Module } from '@nestjs/common';
import { RepositoryImplModule } from './../../infrastructure/repositories/repository-impl.module';
import { SaveUserVoiceChannelStatusCommandHandler } from './save-user-voice-channel-status/SaveUserVoiceChannelStatusCommandHandler';

@Module({
  imports: [RepositoryImplModule],
  providers: [SaveUserVoiceChannelStatusCommandHandler],
  exports: [SaveUserVoiceChannelStatusCommandHandler],
})
export class UserVoiceConnectionStatusModule {}
