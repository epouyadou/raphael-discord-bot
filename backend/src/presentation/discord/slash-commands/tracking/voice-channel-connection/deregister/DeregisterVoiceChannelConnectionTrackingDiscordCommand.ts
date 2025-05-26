import { DeregisterVoiceChannelConnectionTrackingCommand } from '@application/voice-channel-connection-tracking/deregister-voice-channel-connection-tracking/DeregisterVoiceChannelConnectionTrackingCommand';
import { DeregisterVoiceChannelConnectionTrackingCommandHandler } from '@application/voice-channel-connection-tracking/deregister-voice-channel-connection-tracking/DeregisterVoiceChannelConnectionTrackingCommandHandler';
import { Logger } from '@nestjs/common';
import { GuildMember, MessageFlags, Role, User } from 'discord.js';
import {
  Context,
  MentionableOption,
  Options,
  SlashCommandContext,
  Subcommand,
} from 'necord';
import {
  formatGuildRole,
  formatGuildUser,
} from 'src/core/utils/discord_formatter';
import { TrackingGroupCommandDecorator } from '../../TrackingGroupCommandDecorator';

export class DeregisterTargetDto {
  @MentionableOption({
    name: 'mention',
    description: 'The guild member, or role to untrack',
    required: true,
  })
  mentionable: GuildMember | Role | User;
}

@TrackingGroupCommandDecorator()
export class DeregisterVoiceChannelConnectionTrackingDiscordCommand {
  private readonly logger = new Logger(
    DeregisterVoiceChannelConnectionTrackingDiscordCommand.name,
  );

  constructor(
    private readonly deregisterVoiceChannelConnectionTrackingCommandHandler: DeregisterVoiceChannelConnectionTrackingCommandHandler,
  ) {}

  @Subcommand({
    name: 'remove',
    description: 'Remove a voice channel connection tracking order',
  })
  public async onNotifyMe(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable }: DeregisterTargetDto,
  ) {
    const member = interaction.member as GuildMember;

    if (mentionable instanceof User || interaction.guild === null) {
      this.logger.log(
        `User ${member.id} tried to untrack a non guild member or user: ${mentionable.id}`,
      );
      await interaction.reply({
        content:
          'You cannot untrack non guild members because you cannot track them.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Disable the following if statement to test the command with yourself
    if (mentionable.id === member.id) {
      this.logger.log(
        `User ${member.id} tried to untrack themselves: ${mentionable.id}`,
      );
      await interaction.reply({
        content: `You cannot untrack yourself because you can't track yourself.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const isRoleBased = mentionable instanceof Role;

    const command: DeregisterVoiceChannelConnectionTrackingCommand = {
      isRoleBased: isRoleBased,
      isUserBased: !isRoleBased,
      guildId: interaction.guild.id,
      mentionableId: mentionable.id,
      trackerGuildMemberId: member.id,
    };

    const result =
      await this.deregisterVoiceChannelConnectionTrackingCommandHandler.handle(
        command,
      );

    if (result.isFailure()) {
      await interaction.reply({
        content: result.error.message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: `Successfully deregistered ${
        isRoleBased
          ? formatGuildRole(mentionable.id)
          : formatGuildUser(mentionable.id)
      } connection tracking from ${formatGuildUser(member.id)}.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
