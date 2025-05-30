import {
  GetUserTrackingConnectionOrdersQuery,
  GetUserTrackingConnectionOrdersQueryResult,
  TrackerType,
} from '@application/voice-channel-connection-tracking/get-user-tracking-connection-orders/GetUserTrackingConnectionOrdersQuery';
import { GetUserTrackingConnectionOrdersQueryHandler } from '@application/voice-channel-connection-tracking/get-user-tracking-connection-orders/GetUserTrackingConnectionOrdersQueryHandler';
import { Logger } from '@nestjs/common';
import { GuildMember, Role, User } from 'discord.js';
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
import { TrackingGroupCommandDecorator } from '../TrackingGroupCommandDecorator';
import { TrackerInformation } from './../../../../../application/voice-channel-connection-tracking/get-user-tracking-connection-orders/GetUserTrackingConnectionOrdersQuery';

export class TrackingDisplayTargetDto {
  @MentionableOption({
    name: 'mention',
    description:
      'The guild member, role, or user to display tracking connection orders for',
    required: false,
  })
  mentionable: GuildMember | Role | User;
}

@TrackingGroupCommandDecorator()
export class DisplayTrackingConnectionOrderDiscordCommand {
  private readonly logger = new Logger(
    DisplayTrackingConnectionOrderDiscordCommand.name,
  );

  constructor(
    private readonly getUserTrackingConnectionOrdersQueryHandler: GetUserTrackingConnectionOrdersQueryHandler,
    //private readonly getUserRoleTrackingConnectionOrdersQueryHandler: GetUserRoleTrackingConnectionOrdersQueryHandler,
  ) {}

  @Subcommand({
    name: 'display',
    description: 'Display tracking connection orders for a user or role',
  })
  public async onDisplayTrackingConnectionOrder(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable }: TrackingDisplayTargetDto,
  ) {
    if (!interaction.guildId) {
      return interaction.reply({
        content: 'This command can only be used in a guild.',
      });
    }

    const guildId = interaction.guildId;
    const member = interaction.member as GuildMember;

    if (!mentionable) {
      const query: GetUserTrackingConnectionOrdersQuery = {
        guildId,
        userId: member.id,
        userRoleIds: member.roles.cache.map((role) => role.id),
      };

      const result =
        await this.getUserTrackingConnectionOrdersQueryHandler.handle(query);

      if (result.isFailure()) {
        return interaction.reply({
          content: result.error.message,
        });
      }

      return interaction.reply({
        content: this.formatResponse(member, result.value, true),
        allowedMentions: {
          repliedUser: false,
          roles: [],
          users: [],
        },
      });
    }

    if (mentionable instanceof User) {
      return interaction.reply({
        content:
          'This user is not in the guild, so no tracking orders can be displayed.',
      });
    }

    if (mentionable instanceof Role) {
      // TODO: Display all the users tracking this role
      return interaction.reply({
        content: 'This feature is not implemented yet.',
      });
    }

    if (mentionable instanceof GuildMember) {
      const query: GetUserTrackingConnectionOrdersQuery = {
        guildId,
        userId: mentionable.id,
        userRoleIds: mentionable.roles.cache.map((role) => role.id),
      };

      const result =
        await this.getUserTrackingConnectionOrdersQueryHandler.handle(query);

      if (result.isFailure()) {
        return interaction.reply({
          content: result.error.message,
        });
      }

      return interaction.reply({
        content: this.formatResponse(
          mentionable,
          result.value,
          mentionable.id === member.id,
        ),
        allowedMentions: {
          repliedUser: false,
          roles: [],
          users: [],
        },
      });
    }
  }

  formatResponse(
    member: GuildMember,
    data: GetUserTrackingConnectionOrdersQueryResult,
    isSender: boolean,
  ): string {
    const {
      trackerCount,
      trackers,
      trackedUserCount,
      trackedRoleCount,
      totalTrackedUsers,
      totalTrackingOrders,
      trackedUsers,
      trackedRoles,
    } = data;

    if (trackerCount === 0 && totalTrackingOrders === 0) {
      return `${this.formatFromSender('You are', member.displayName, isSender)} not tracked or tracking any users or roles. ${this.formatFromSender(`Is ${member.displayName}`, 'Are you', isSender)} a saint? Or just a loner?`;
    }

    const response = new StringBuilder();

    response.appendCodeBlock(
      `${this.formatFromSender('You are', member.displayName, isSender).toUpperCase()} BEING TRACKED BY`,
    );
    response.appendLineBold(`__Trackers :__`);
    if (trackerCount === 0) {
      response.appendLine(
        `No users are tracking ${this.formatFromSender('you', member.displayName, isSender)}!.`,
      );
    } else {
      response.appendLine(
        trackers
          .map(
            (tracker: TrackerInformation) =>
              `${formatGuildUser(tracker.userId)}${
                tracker.trackerType === TrackerType.Role
                  ? ` (By tracking ${formatGuildRole(tracker.roleId!)})`
                  : ''
              }`,
          )
          .join(', '),
      );
    }
    response.jumpLine();

    response.appendCodeBlock(
      `${this.formatFromSender(`You're`, `${member.displayName} is`, isSender).toUpperCase()} TRACKING`,
    );
    response.appendLineBold(`__Tracked Users:__`);
    if (trackedUserCount === 0) {
      response.appendLine(
        `${this.formatFromSender(`You're`, member.displayName, isSender)} not tracking any users.`,
      );
    } else {
      response.appendLine(
        trackedUsers
          .map((trackedUser: string) => `${formatGuildUser(trackedUser)}`)
          .join(', '),
      );
    }
    response.jumpLine();

    response.appendLineBold(`__Tracked Roles__`);
    if (trackedRoleCount === 0) {
      response.appendLine(
        `${this.formatFromSender(`You're`, member.displayName, isSender)} not tracking any roles.`,
      );
    } else {
      response.appendLine(
        trackedRoles
          .map(
            (trackedRole: { id: string; roleMemberCount: number }) =>
              `${formatGuildRole(trackedRole.id)} (${trackedRole.roleMemberCount} members)`,
          )
          .join(', '),
      );
    }

    if (trackedRoleCount > 0 || (trackedUserCount > 0 && trackerCount > 0)) {
      response.jumpLine(2);
    }

    if (trackedRoleCount > 0) {
      response.append(`**Total Tracked Users:** `);

      if (totalTrackedUsers === 0) {
        response.appendLine(
          `${this.formatFromSender(`You're`, `${member.displayName} is`, isSender)} not tracking any users.`,
        );
      } else {
        response.appendLine(
          `${this.formatFromSender(`You're`, `${member.displayName} is`, isSender)} tracking a total of **${totalTrackedUsers}** users.`,
        );
      }
    }

    if (trackedUserCount > 0 && trackedRoleCount > 0) {
      response.append(`**Total Tracking Orders:** `);
      if (totalTrackingOrders === 0) {
        response.appendLine(
          `${this.formatFromSender('You have', `${member.displayName} has`, isSender)} no tracking orders.`,
        );
      } else {
        response.appendLine(
          `${this.formatFromSender('You have', `${member.displayName} has`, isSender)} a total of **${totalTrackingOrders}** tracking orders.`,
        );
      }
    }

    return response.toString();
  }

  formatFromSender(
    ifSender: string,
    orElse: string,
    isSender: boolean,
  ): string {
    return isSender ? ifSender : orElse;
  }
}
