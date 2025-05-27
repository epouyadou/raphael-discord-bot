import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { getEnv } from 'src/core/utils/env';

@Injectable()
export class TestBehaviorCommand {
  private readonly logger = new Logger(TestBehaviorCommand.name);

  constructor(
    @Inject(ICommunicationPlatformSymbol)
    private readonly communicationPlatform: ICommunicationPlatform,
  ) {}

  @SlashCommand({
    name: 'test-behavior',
    description:
      'Just a test command to check behavior. Restricted to the bot developer(s).',
  })
  public async onTestBehavior(@Context() [interaction]: SlashCommandContext) {
    // Check if the command is run in one of the developer guilds
    const developerGuilds: string[] = getEnv('DISCORD_BOT_DEVELOPERS_IDs');
    if (!developerGuilds.includes(interaction.user.id)) {
      return interaction.reply({
        content:
          'This command can only be used by the developer(s) of this bot.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // TEST YOUR BEHAVIOR HERE

    const isExistingInGuild =
      await this.communicationPlatform.isUserExistInGuild(
        '245229012870234112',
        interaction.user.id,
      );

    this.logger.log(
      `Is User ${interaction.user.id} exists in guild ${interaction.guildId}: ${isExistingInGuild}`,
    );

    // RESPOND TO THE INTERACTION WHEN THE TEST IS COMPLETE
    return interaction.reply({
      content: 'Done!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
