import { GetLastUserVoiceChannelConnectionStatusQuery } from '@application/user-voice-connection-status/get-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQuery';
import { GetLastUserVoiceChannelConnectionStatusQueryHandler } from '@application/user-voice-connection-status/get-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQueryHandler';
import { OrderingType } from '@domain/core/primitives/OrderingType';
import { Logger } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
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
  StringOption,
  Subcommand,
} from 'necord';
import {
  formatGuildUser,
  formatVoiceChannel,
} from 'src/core/utils/discord_formatter';
import { LogGroupCommandDecorator } from '../LogGroupCommandDecorator';

export class LogUserVoiceConnectionStatusTargetDto {
  @MentionableOption({
    name: 'mention',
    description:
      'The guild member, role, or user to display the voice connection logs for',
    required: false,
  })
  mentionable: GuildMember | Role | User;

  @StringOption({
    name: 'order',
    description: 'The order of the voice connection logs',
    required: false,
    choices: [
      {
        name: 'Ascending',
        value: OrderingType.ASC,
      },
      {
        name: 'Descending',
        value: OrderingType.DESC,
      },
    ],
  })
  order: OrderingType;
}

@LogGroupCommandDecorator()
export class LogUserVoiceConnectionStatusDiscordCommand {
  private readonly logger = new Logger(
    LogUserVoiceConnectionStatusDiscordCommand.name,
  );

  constructor(
    private readonly getLastUserVoiceConnectionStatusQueryHandler: GetLastUserVoiceChannelConnectionStatusQueryHandler,
  ) {}

  @Subcommand({
    name: 'voice-connections',
    description: 'Get the last voice channel connections of a user',
  })
  async onLogUserVoiceConnectionStatus(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable, order }: LogUserVoiceConnectionStatusTargetDto,
  ): Promise<void> {
    const member = interaction.member as GuildMember;

    if (!mentionable) {
      await this.displayUserLogs(interaction, member, order);
      return;
    }

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

    if (mentionable instanceof Role) {
      await interaction.reply({
        content: `Not implemented yet !`,
      });
      return;
    }
  }

  private async displayUserLogs(
    interaction: ChatInputCommandInteraction<CacheType>,
    member: GuildMember,
    order: OrderingType | undefined,
  ): Promise<void> {
    const query: GetLastUserVoiceChannelConnectionStatusQuery = {
      guildId: interaction.guild!.id,
      userId: member.id,
      cursor: 0,
      orderedBy: order || OrderingType.DESC,
    };

    const result =
      await this.getLastUserVoiceConnectionStatusQueryHandler.handle(query);

    if (result.userVoiceConnectionStatus.length === 0) {
      await interaction.reply({
        content: `No voice connection logs found for ${formatGuildUser(member.id)}.`,
        allowedMentions: {
          repliedUser: false,
          roles: [],
          users: [],
        },
      });
      return;
    }

    const logs = result.userVoiceConnectionStatus
      .map((record) => this.formatLog(record))
      .join('\n');

    await interaction.reply({
      content: `Voice connection logs for ${formatGuildUser(member.id)}:\n${logs}`,
      allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
      },
    });
  }

  private formatLog(record: {
    createdAt: Date;
    fromVoiceChannelId: string | null;
    toVoiceChannelId: string | null;
  }): string {
    let formatedLog = `${record.createdAt.toISOString()} - `;

    if (record.fromVoiceChannelId === null && record.toVoiceChannelId) {
      formatedLog += `Connection to the voice channel ${formatVoiceChannel(record.toVoiceChannelId)}.`;
    } else if (record.fromVoiceChannelId && record.toVoiceChannelId === null) {
      formatedLog += `Disconnection from the voice channel ${formatVoiceChannel(record.fromVoiceChannelId)}.`;
    } else if (
      record.fromVoiceChannelId &&
      record.toVoiceChannelId &&
      record.fromVoiceChannelId !== record.toVoiceChannelId
    ) {
      formatedLog += `Moved from voice channel ${formatVoiceChannel(record.fromVoiceChannelId)} to ${formatVoiceChannel(record.toVoiceChannelId)}.`;
    }

    return formatedLog;
  }
}
