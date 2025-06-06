import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand } from '@application/voice-channel-connection-tracking/register-role-based-voice-channel-connection-tracking/RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler } from '@application/voice-channel-connection-tracking/register-role-based-voice-channel-connection-tracking/RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand } from '@application/voice-channel-connection-tracking/register-user-based-voice-channel-connection-tracking/RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler } from '@application/voice-channel-connection-tracking/register-user-based-voice-channel-connection-tracking/RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler';
import { Logger } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  DiscordAPIError,
  GuildMember,
  MessageFlags,
  Role,
  User,
} from 'discord.js';
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
import { StringBuilder } from 'src/core/utils/string_builder';
import { TrackingGroupCommandDecorator } from '../../TrackingGroupCommandDecorator';

export class NotifyMeOnVoiceChannelConnectionDto {
  @MentionableOption({
    name: 'mention',
    description: 'The guild member, or role to track',
    required: true,
  })
  mentionable: GuildMember | Role | User;
}

@TrackingGroupCommandDecorator()
export class RegisterVoiceChannelConnectionTrackingDiscordCommand {
  private readonly logger = new Logger(
    RegisterVoiceChannelConnectionTrackingDiscordCommand.name,
  );

  constructor(
    private readonly registerRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
    private readonly registerUserBasedVoiceChannelConnexionTrackingOrderCommandHandler: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
  ) {}

  @Subcommand({
    name: 'voice-channel-connection-of',
    description: 'Notify me when somebody is connecting in a voice channel',
  })
  public async onNotifyMe(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable }: NotifyMeOnVoiceChannelConnectionDto,
  ) {
    const member = interaction.member as GuildMember;

    if (mentionable instanceof User || interaction.guild === null) {
      this.logger.log(
        `User ${member.id} tried to track a non guild member or user: ${mentionable.id}`,
      );
      await interaction.reply({
        content: 'You cannot track non guild members.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Disable the following if statement to test the command with yourself
    if (mentionable.id === member.id) {
      this.logger.log(
        `User ${member.id} tried to track themselves: ${mentionable.id}`,
      );
      await interaction.reply({
        content: 'You cannot track yourself.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (mentionable instanceof GuildMember) {
      await this.registerUserBased(interaction, member, mentionable);
    } else {
      await this.registerRoleBased(interaction, member, mentionable);
    }
  }

  private async registerUserBased(
    interaction: ChatInputCommandInteraction<CacheType>,
    member: GuildMember,
    mentionable: GuildMember,
  ) {
    const command: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: interaction.guildId!,
        trackerGuildMemberId: member.id,
        trackedGuildMemberId: mentionable.id,
      };

    const result =
      await this.registerUserBasedVoiceChannelConnexionTrackingOrderCommandHandler.handle(
        command,
      );

    if (result.isFailure()) {
      this.logger.log(
        `Failed to register role-based voice channel connection tracking order: ${result.error.message}`,
      );
      await interaction.reply({
        content: result.error.message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await member.send({
        content: `You will be notified when ${formatGuildUser(mentionable.id)} connects to a vocal channel.`,
      });
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        this.logger.log(
          `Failed to send DM to user ${member.id}: ${error.message}`,
        );
        await interaction.reply({
          content: this.getSentDMErrorMessage(mentionable),
          flags: MessageFlags.Ephemeral,
        });
      } else {
        this.logger.error(
          `An unexpected error occurred while sending DM to user ${member.id}: ${error}`,
        );
      }
      return;
    }
  }

  private async registerRoleBased(
    interaction: ChatInputCommandInteraction<CacheType>,
    member: GuildMember,
    mentionable: Role,
  ) {
    const command: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: interaction.guildId!,
        trackerGuildMemberId: member.id,
        trackedGuildRoleId: mentionable.id,
      };

    const result =
      await this.registerRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler.handle(
        command,
      );

    if (result.isFailure()) {
      this.logger.log(
        `Failed to register role-based voice channel connection tracking order: ${result.error.message}`,
      );
      await interaction.reply({
        content: result.error.message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await member.send({
        content: `You will be notified when a user with the ${formatGuildRole(mentionable.id)} role connects to a vocal channel.`,
      });
    } catch (error) {
      if (error instanceof DiscordAPIError) {
        this.logger.log(
          `Failed to send DM to user ${member.id}: ${error.message}`,
        );
        await interaction.reply({
          content: this.getSentDMErrorMessage(mentionable),
          flags: MessageFlags.Ephemeral,
        });
      } else {
        this.logger.error(
          `An unexpected error occurred while sending DM to user ${member.id}: ${error}`,
        );
      }
      return;
    }
  }

  private getSentDMErrorMessage(mentionable: GuildMember | Role): string {
    const stringBuilder: StringBuilder = new StringBuilder();
    stringBuilder.append(
      `Your tracking order has been registered, but you will not receive notifications when `,
    );

    if (mentionable instanceof GuildMember) {
      stringBuilder.append(formatGuildUser(mentionable.id));
    } else {
      stringBuilder.append(
        `a user with the ${formatGuildRole(mentionable.id)} role`,
      );
    }

    stringBuilder.appendLine(
      ` connects to a vocal channel unless you allow DMs from this server.`,
    );
    stringBuilder.append(
      `Please change your server privacy settings and try again.`,
    );
    return stringBuilder.toString();
  }
}
