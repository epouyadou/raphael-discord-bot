import { UserVoiceConnectionStatusModule } from '@application/user-voice-connection-status/user-voice-connection-status.module';
import { VoiceChannelConnectionTrackingModule } from '@application/voice-channel-connection-tracking/voice-channel-connection-tracking.module';
import { Module } from '@nestjs/common';
import { GuildVoiceChannelStatusListener } from './voice-chanel/guild-voice-channel-status.listener';

@Module({
  imports: [
    VoiceChannelConnectionTrackingModule,
    UserVoiceConnectionStatusModule,
  ],
  providers: [GuildVoiceChannelStatusListener],
})
export class DiscordEventListenersModule {}
