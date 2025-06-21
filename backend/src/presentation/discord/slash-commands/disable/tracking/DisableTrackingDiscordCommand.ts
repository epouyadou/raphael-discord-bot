import { DisableTrackingCommand } from '@application/voice-channel-connection-tracking/disable-tracking/DisableTrackingCommand';
import { DisableTrackingCommandHandler } from '@application/voice-channel-connection-tracking/disable-tracking/DisableTrackingCommandHandler';
import { Logger } from '@nestjs/common';
import { GuildMember, MessageFlags, Role, User } from 'discord.js';
import {
  Context,
  MentionableOption,
  Options,
  SlashCommandContext,
  StringOption,
  Subcommand,
} from 'necord';
import { DisableGroupCommandDecorator } from '../DisableGroupCommandDecorator';

export class DisableTrackingDto {
  @MentionableOption({
    name: 'mention',
    description: 'The guild member, role, or user to disable tracking',
    required: false,
  })
  mentionable?: GuildMember | Role | User;
  @StringOption({
    name: 'duration',
    description: 'The time to disable tracking for (ex: 1s, 1m, 1h, 1d, ...)',
    required: false,
  })
  duration?: string;
}

@DisableGroupCommandDecorator()
export class DisplayTrackingConnectionOrderDiscordCommand {
  private readonly logger = new Logger(
    DisplayTrackingConnectionOrderDiscordCommand.name,
  );

  constructor(
    private readonly disableTrackingCommandHandler: DisableTrackingCommandHandler,
  ) {}

  @Subcommand({
    name: 'tracking',
    description: 'Display tracking connection orders for a user or role',
  })
  public async onDisplayTrackingConnectionOrder(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable, duration: duration }: DisableTrackingDto,
  ) {
    const command: DisableTrackingCommand = {
      guildId: interaction.guildId || undefined,
      userId: interaction.user.id,
      mentionable: mentionable as GuildMember | Role | User,
      duration: duration,
    };

    const result = await this.disableTrackingCommandHandler.handle(command);
    if (result.isFailure()) {
      this.logger.error(
        `Failed to disable tracking for ${mentionable?.toString() || 'all orders'}: ${result.error.message}`,
      );
      return interaction.reply({
        content: `Failed to disable tracking: ${result.error.message}`,
        ephemeral: true,
      });
    }
    return interaction.reply({
      content: mentionable
        ? `Tracking has been disabled for ${mentionable.toString()} ${duration ? `for ${duration}` : 'indefinitely'}.`
        : `You have disabled all of your tracking orders ${duration ? `for ${duration}` : 'indefinitely'}.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
