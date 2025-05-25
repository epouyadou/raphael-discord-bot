import { Module } from '@nestjs/common';
import { VoiceChannelConnectionTrackingModule } from './voice-channel-connection-tracking/voice-channel-connection-tracking.module';

@Module({
  imports: [VoiceChannelConnectionTrackingModule],
})
export class ApplicationModule {}
