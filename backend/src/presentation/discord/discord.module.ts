import { Module } from '@nestjs/common';
import { DiscordEventListenersModule } from './event-listeners/discord-event-listeners.module';
import { DiscordSlashCommandsModule } from './slash-commands/discord-slash-commands.module';

@Module({
  imports: [DiscordSlashCommandsModule, DiscordEventListenersModule],
  providers: [],
})
export class DiscordModule {}
