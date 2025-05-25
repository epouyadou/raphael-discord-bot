import { Module } from '@nestjs/common';
import { NotifyCommandsModule } from './notify/notify-commands.module';

@Module({
  imports: [NotifyCommandsModule],
  providers: [],
})
export class DiscordSlashCommandsModule {}
