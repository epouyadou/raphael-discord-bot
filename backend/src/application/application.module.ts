import { Module } from '@nestjs/common';
import { UserVoiceConnectionStatusModule } from './user-voice-connection-status/user-voice-connection-status.module';
import { VoiceChannelConnectionTrackingModule } from './voice-channel-connection-tracking/voice-channel-connection-tracking.module';

@Module({
  imports: [
    VoiceChannelConnectionTrackingModule,
    UserVoiceConnectionStatusModule,
  ],
})
export class ApplicationModule {}
