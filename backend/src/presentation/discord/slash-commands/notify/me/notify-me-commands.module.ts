import { VoiceChannelConnectionTrackingModule } from '@application/voice-channel-connection-tracking/voice-channel-connection-tracking.module';
import { Module } from '@nestjs/common';
import { NotifyMeOnVoiceChannelConnectionCommand } from './on-voice-channel-connection/on-voice-channel-connection.command';

@Module({
  imports: [VoiceChannelConnectionTrackingModule],
  providers: [NotifyMeOnVoiceChannelConnectionCommand],
})
export class NotifyMeCommandsModule {}
