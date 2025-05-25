import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { SaveUserVoiceChannelStatusCommandHandler } from './save-user-voice-channel-status/SaveUserVoiceChannelStatusCommandHandler';

@Module({
  imports: [InfrastructureModule],
  providers: [SaveUserVoiceChannelStatusCommandHandler],
  exports: [SaveUserVoiceChannelStatusCommandHandler],
})
export class UserVoiceConnectionStatusModule {}
