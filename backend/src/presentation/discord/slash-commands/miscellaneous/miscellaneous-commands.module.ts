import { CommunicationPlatformImplModule } from '@infrastructure/communication-platform/communication-platform-impl.module';
import { Module } from '@nestjs/common';
import { PingCommand } from './ping/ping.command';
import { TestBehaviorCommand } from './test-behavior/test-behavior.command';

@Module({
  imports: [CommunicationPlatformImplModule],
  providers: [PingCommand, TestBehaviorCommand],
})
export class MiscellaneousCommandsModule {}
