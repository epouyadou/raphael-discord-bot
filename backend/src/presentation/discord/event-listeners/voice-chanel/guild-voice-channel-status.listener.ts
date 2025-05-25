import { NotifyConnectionOfTrackedUserCommand } from '@application/voice-channel-connection-tracking/notify-connection-of-tracked-user/NotifyConnectionOfTrackedUserCommand';
import { NotifyConnectionOfTrackedUserCommandHandler } from '@application/voice-channel-connection-tracking/notify-connection-of-tracked-user/NotifyConnectionOfTrackedUserCommandHandler';
import { NotifyConnectionOfUserWithTrackedRoleCommand } from '@application/voice-channel-connection-tracking/notify-connection-of-user-with-tracked-role/NotifyConnectionOfUserWithTrackedRoleCommand';
import { NotifyConnectionOfUserWithTrackedRoleCommandHandler } from '@application/voice-channel-connection-tracking/notify-connection-of-user-with-tracked-role/NotifyConnectionOfUserWithTrackedRoleCommandHandler';
import { Inject, Logger } from '@nestjs/common';
import { Snowflake } from '@shared/types/snowflake';
import { Client } from 'discord.js';
import { Context, ContextOf, On } from 'necord';

export class GuildVoiceChannelStatusListener {
  private readonly logger = new Logger(GuildVoiceChannelStatusListener.name);

  constructor(
    @Inject()
    private client: Client,
    private readonly notifyConnectionOfTrackedUserCommandHandler: NotifyConnectionOfTrackedUserCommandHandler,
    private readonly notifyConnectionOfUserWithTrackedRoleCommandHandler: NotifyConnectionOfUserWithTrackedRoleCommandHandler,
  ) {}

  @On('voiceChannelJoin')
  async onVoiceChannelJoin(
    @Context() [member, voiceChannel]: ContextOf<'voiceChannelJoin'>,
  ) {
    // When a user connects to a voice channel, check if they are being tracked (id or role)
    // If they are, send a message to the users who are tracking them
    // If the user is not being tracked, do nothing
    // If the user is already in the same voice channel, do nothing

    this.logger.log(
      `User ${member.id} joined voice channel ${voiceChannel.id}`,
    );

    // TODO: Register the event in the database
    // await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
    //   member.id,
    //   voiceChannel.guildId,
    //   null,
    //   voiceChannel.id,
    // );

    const guild = await this.client.guilds
      .fetch(voiceChannel.guildId)
      .catch((error) => {
        this.logger.error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Failed to fetch guild ${voiceChannel.guildId}: ${error.message}`,
        );
        return null;
      });

    if (!guild) {
      return;
    }

    const notifyConnectionOfTrackedUserCommand: NotifyConnectionOfTrackedUserCommand =
      {
        guildId: voiceChannel.guildId,
        guildMemberId: member.id,
        voiceChannelId: voiceChannel.id,
        isInTheVoiceChannel: (userId: Snowflake) =>
          voiceChannel.members.has(userId),
        alreadyNotifiedGuildMemberIds: [],
      };

    const notifyConnectionOfTrackedUserResult =
      await this.notifyConnectionOfTrackedUserCommandHandler.handle(
        notifyConnectionOfTrackedUserCommand,
      );

    if (notifyConnectionOfTrackedUserResult.isFailure()) {
      this.logger.error(
        `Failed to notify users about user ${member.id} connection: ${notifyConnectionOfTrackedUserResult.error.message}`,
      );
      return;
    }

    const notifyConnectionOfUserWithTrackedRoleCommand: NotifyConnectionOfUserWithTrackedRoleCommand =
      {
        guildId: voiceChannel.guildId,
        guildMemberId: member.id,
        guildMemberRoleIds: member.roles.cache.map((role) => role.id),
        voiceChannelId: voiceChannel.id,
        isInTheVoiceChannel: (userId: Snowflake) =>
          voiceChannel.members.has(userId),
        alreadyNotifiedGuildMemberIds:
          notifyConnectionOfTrackedUserResult.value,
      };

    await this.notifyConnectionOfUserWithTrackedRoleCommandHandler.handle(
      notifyConnectionOfUserWithTrackedRoleCommand,
    );
  }

  @On('voiceChannelLeave')
  async onVoiceChannelLeave(
    @Context() [member, voiceChannel]: ContextOf<'voiceChannelLeave'>,
  ) {
    this.logger.log(
      `User ${member.id} leaved voice channel ${voiceChannel.id}`,
    );

    // TODO: Register the event in the database
    // await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
    //   member.id,
    //   voiceChannel.guildId,
    //   voiceChannel.id,
    //   null,
    // );
  }

  @On('voiceChannelSwitch')
  async onVoiceChannelSwitch(
    @Context()
    [member, fromChannel, toChannel]: ContextOf<'voiceChannelSwitch'>,
  ) {
    this.logger.log(
      `User ${member.id} switched from voice channel ${fromChannel.id} to ${toChannel.id}`,
    );

    // TODO: Register the event in the database
    // await this.notifyMeOnVoiceChannelConnectionService.registerVoiceChannelStatus(
    //   member.id,
    //   fromChannel.guildId,
    //   fromChannel.id,
    //   toChannel.id,
    // );
  }
}
