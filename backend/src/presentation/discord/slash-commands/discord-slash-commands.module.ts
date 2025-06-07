import { Module } from '@nestjs/common';
import { LogCommandsModule } from './log/log-commands.module';
import { MiscellaneousCommandsModule } from './miscellaneous/miscellaneous-commands.module';
import { TrackingCommandsModule } from './tracking/tracking-commands.module';

@Module({
  imports: [
    TrackingCommandsModule,
    MiscellaneousCommandsModule,
    LogCommandsModule,
  ],
  providers: [],
})
export class DiscordSlashCommandsModule {}
