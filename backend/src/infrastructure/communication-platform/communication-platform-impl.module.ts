import { Module } from '@nestjs/common';
import { DiscordCommunicationPlatformProvider } from './DiscordCommunicationPlatform';

@Module({
  providers: [DiscordCommunicationPlatformProvider],
  exports: [DiscordCommunicationPlatformProvider],
})
export class CommunicationPlatformImplModule {}
