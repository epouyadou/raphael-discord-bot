import { VoiceConnectionStatusModule } from '@application/voice-connection-status/voice-connection-status.module';
import { CommonImplModule } from '@infrastructure/common/common-impl.module';
import { Module } from '@nestjs/common';
import { LogUserVoiceConnectionStatusDiscordCommand } from './voice-connection/LogUserVoiceConnectionStatusDiscordCommand';

@Module({
  imports: [VoiceConnectionStatusModule, CommonImplModule],
  providers: [LogUserVoiceConnectionStatusDiscordCommand],
})
export class LogCommandsModule {}
