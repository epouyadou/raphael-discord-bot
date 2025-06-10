import {
  IDateTimeFormatter,
  IDateTimeFormatterSymbol,
} from '@application/abstractions/common/IDateTimeFormatter';
import { GetLastRoleVoiceChannelConnectionStatusQuery } from '@application/voice-connection-status/get-last-role-voice-connection-status/GetLastRoleVoiceChannelConnectionStatusQuery';
import { GetLastRoleVoiceChannelConnectionStatusQueryHandler } from '@application/voice-connection-status/get-last-role-voice-connection-status/GetLastRoleVoiceChannelConnectionStatusQueryHandler';
import { GetLastUserVoiceChannelConnectionStatusQuery } from '@application/voice-connection-status/get-last-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQuery';
import { GetLastUserVoiceChannelConnectionStatusQueryHandler } from '@application/voice-connection-status/get-last-user-voice-connection-status/GetLastUserVoiceChannelConnectionStatusQueryHandler';
import { OrderingType } from '@domain/core/primitives/OrderingType';
import { VoiceChannelStatusRecord } from '@domain/voice-channel-status-records/VoiceChannelStatusRecord';
import { Inject, Logger } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  Role,
  Snowflake,
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
    private readonly getLastRoleVoiceConnectionStatusQueryHandler: GetLastRoleVoiceChannelConnectionStatusQueryHandler,
    @Inject(IDateTimeFormatterSymbol)
    private readonly dateTimeFromatter: IDateTimeFormatter,
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
      await this.displayUserLogs(interaction, member.id, member, order);
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
      await this.displayRoleLogs(interaction, member.id, mentionable, order);
      return;
    }

    await this.displayUserLogs(interaction, member.id, mentionable, order);
  }

  private async displayRoleLogs(
    interaction: ChatInputCommandInteraction<CacheType>,
    querierId: Snowflake,
    role: Role,
    order: OrderingType | undefined,
  ): Promise<void> {
    const query: GetLastRoleVoiceChannelConnectionStatusQuery = {
      querierId: querierId,
      guildId: interaction.guild!.id,
      roleId: role.id,
      orderedBy: order || OrderingType.DESC,
    };

    const result =
      await this.getLastRoleVoiceConnectionStatusQueryHandler.handle(query);

    if (result.userVoiceConnectionStatus.length === 0) {
      await interaction.reply({
        content: `No voice connection logs found for the role ${role.name}.`,
        allowedMentions: {
          repliedUser: false,
          roles: [],
          users: [],
        },
      });
      return;
    }

    const logs = result.userVoiceConnectionStatus
      .map((record) => this.formatLog(record, true))
      .join('\n');

    await interaction.reply({
      content: `Voice connection logs for the role ${role.name}:\n${logs}`,
      allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
      },
    });
  }

  private async displayUserLogs(
    interaction: ChatInputCommandInteraction<CacheType>,
    querierId: Snowflake,
    user: GuildMember,
    order: OrderingType | undefined,
  ): Promise<void> {
    const query: GetLastUserVoiceChannelConnectionStatusQuery = {
      querierId: querierId,
      guildId: interaction.guild!.id,
      userId: user.id,
      cursor: 0,
      orderedBy: order || OrderingType.DESC,
    };

    const result =
      await this.getLastUserVoiceConnectionStatusQueryHandler.handle(query);

    if (result.userVoiceConnectionStatus.length === 0) {
      await interaction.reply({
        content: `No voice connection logs found for ${formatGuildUser(user.id)}.`,
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
      content: `Voice connection logs for ${formatGuildUser(user.id)}:\n${logs}`,
      allowedMentions: {
        repliedUser: false,
        roles: [],
        users: [],
      },
    });
  }

  private formatLog(
    record: VoiceChannelStatusRecord,
    isFormatingForRoleLog: boolean = false,
  ): string {
    let formatedLog = '';

    if (isFormatingForRoleLog) {
      formatedLog = `${formatGuildUser(record.guildMemberId)} has `;
    } else {
      formatedLog = `Has `;
    }

    if (record.fromVoiceChannelId === null && record.toVoiceChannelId) {
      formatedLog += `**connected** to the voice channel ${formatVoiceChannel(record.toVoiceChannelId)}`;
    } else if (record.fromVoiceChannelId && record.toVoiceChannelId === null) {
      formatedLog += `**disconnected** from the voice channel ${formatVoiceChannel(record.fromVoiceChannelId)}`;
    } else if (
      record.fromVoiceChannelId &&
      record.toVoiceChannelId &&
      record.fromVoiceChannelId !== record.toVoiceChannelId
    ) {
      formatedLog += `**moved** from voice channel ${formatVoiceChannel(record.fromVoiceChannelId)} to ${formatVoiceChannel(record.toVoiceChannelId)}`;
    }

    formatedLog += ` the **${this.dateTimeFromatter.formatDate(record.createdAt)}** at **${this.dateTimeFromatter.formatTime(record.createdAt)}**.`;

    return formatedLog;
  }
}
