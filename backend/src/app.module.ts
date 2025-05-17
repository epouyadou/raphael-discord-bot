import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { AppService } from './app.service';
import { AppCommandsModule } from './commands/app-commands.module';
import { PostgresModule } from './core/postgres/postgres.module';
import { getEnv } from './core/utils/env';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PostgresModule,
    NecordModule.forRoot({
      token: getEnv('DISCORD_TOKEN'),
      intents: [IntentsBitField.Flags.Guilds],
      development: [getEnv('DISCORD_DEVELOPMENT_GUILD_ID')],
    }),
    AppCommandsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
