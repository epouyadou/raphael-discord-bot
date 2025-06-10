import { Module } from '@nestjs/common';
import { VoiceChannelConnectionTrackingModule } from './voice-channel-connection-tracking/voice-channel-connection-tracking.module';
import { VoiceConnectionStatusModule } from './voice-connection-status/voice-connection-status.module';

@Module({
  imports: [VoiceChannelConnectionTrackingModule, VoiceConnectionStatusModule],
})
export class ApplicationModule {}
