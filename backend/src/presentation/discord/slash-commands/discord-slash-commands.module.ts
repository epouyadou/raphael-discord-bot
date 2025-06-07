import { Module } from '@nestjs/common';
import { MiscellaneousCommandsModule } from './miscellaneous/miscellaneous-commands.module';
import { TrackingCommandsModule } from './tracking/tracking-commands.module';

@Module({
  imports: [TrackingCommandsModule, MiscellaneousCommandsModule],
  providers: [],
})
export class DiscordSlashCommandsModule {}
