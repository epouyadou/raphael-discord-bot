import { VoiceChannelConnectionTrackingModule } from '@application/voice-channel-connection-tracking/voice-channel-connection-tracking.module';
import { VoiceConnectionStatusModule } from '@application/voice-connection-status/voice-connection-status.module';
import { Module } from '@nestjs/common';
import { GuildVoiceChannelStatusListener } from './voice-chanel/guild-voice-channel-status.listener';

@Module({
  imports: [VoiceChannelConnectionTrackingModule, VoiceConnectionStatusModule],
  providers: [GuildVoiceChannelStatusListener],
})
export class DiscordEventListenersModule {}
