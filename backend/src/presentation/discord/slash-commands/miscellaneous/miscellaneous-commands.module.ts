import { Module } from '@nestjs/common';
import { PingCommand } from './ping/ping.command';

@Module({
  providers: [PingCommand],
})
export class MiscellaneousCommandsModule {}
