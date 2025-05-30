import { ApplicationModule } from '@application/application.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from '@presentation/discord/discord.module';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { AppService } from './app.service';
import { getEnv } from './core/utils/env';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NecordModule.forRoot({
      token: getEnv('DISCORD_TOKEN'),
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
      ],
      development: getEnv('DISCORD_DEVELOPMENT_GUILD_IDs'),
    }),
    InfrastructureModule,
    ApplicationModule,
    DiscordModule,
  ],
  providers: [AppService],
})
export class AppModule {}
