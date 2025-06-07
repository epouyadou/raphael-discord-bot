import { UserVoiceConnectionStatusModule } from '@application/user-voice-connection-status/user-voice-connection-status.module';
import { Module } from '@nestjs/common';
import { LogUserVoiceConnectionStatusDiscordCommand } from './voice-connection/LogUserVoiceConnectionStatusDiscordCommand';

@Module({
  imports: [UserVoiceConnectionStatusModule],
  providers: [LogUserVoiceConnectionStatusDiscordCommand],
})
export class LogCommandsModule {}
