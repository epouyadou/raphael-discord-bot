import { VoiceChannelConnectionTrackingModule } from '@application/voice-channel-connection-tracking/voice-channel-connection-tracking.module';
import { Module } from '@nestjs/common';
import { DeregisterVoiceChannelConnectionTrackingDiscordCommand } from './voice-channel-connection/deregister/DeregisterVoiceChannelConnectionTrackingDiscordCommand';
import { RegisterVoiceChannelConnectionTrackingDiscordCommand } from './voice-channel-connection/register/RegisterVoiceChannelConnectionTrackingDiscordCommand';

@Module({
  imports: [VoiceChannelConnectionTrackingModule],
  providers: [
    RegisterVoiceChannelConnectionTrackingDiscordCommand,
    DeregisterVoiceChannelConnectionTrackingDiscordCommand,
  ],
})
export class TrackingCommandsModule {}
