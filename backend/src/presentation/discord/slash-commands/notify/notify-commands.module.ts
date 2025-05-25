import { Module } from '@nestjs/common';
import { NotifyMeCommandsModule } from './me/notify-me-commands.module';

@Module({
  imports: [NotifyMeCommandsModule],
  providers: [],
})
export class NotifyCommandsModule {}
