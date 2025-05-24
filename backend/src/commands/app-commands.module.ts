import { Module } from '@nestjs/common';
import { PingCommand } from './miscellaneous/ping/ping.command';
import { NotifyMeOnVoiceChannelConnectionCommand } from './notify/notify-me/NotifyMeOnVoiceChannelConnection.command';
import { NotifyMeOnVoiceChannelConnectionListeners } from './notify/notify-me/NotifyMeOnVoiceChannelConnection.listeners';
import { NotifyMeOnVoiceChannelConnectionService } from './notify/notify-me/NotifyMeOnVoiceChannelConnection.service';

@Module({
  providers: [
    PingCommand,
    NotifyMeOnVoiceChannelConnectionCommand,
    NotifyMeOnVoiceChannelConnectionService,
    NotifyMeOnVoiceChannelConnectionListeners,
  ],
})
export class AppCommandsModule {}
