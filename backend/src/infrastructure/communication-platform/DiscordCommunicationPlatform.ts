import { ICommunicationPlatform } from '@application/abstractions/communication-platform/ICommunicationPlatform';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Client,
  DiscordAPIError,
  Guild,
  GuildMember,
  Snowflake,
  User,
  VoiceChannel,
} from 'discord.js';
import { ICommunicationPlatformSymbol } from './../../application/abstractions/communication-platform/ICommunicationPlatform';

@Injectable()
export class DiscordCommunicationPlatform implements ICommunicationPlatform {
  private readonly logger = new Logger(DiscordCommunicationPlatform.name);

  constructor(@Inject() private readonly client: Client) {}

  private async fetchUser(userId: Snowflake): Promise<User | null> {
    try {
      return await this.client.users.fetch(userId);
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10013) {
        this.logger.error(`User ${userId} not found: ${error.message}`);
      } else {
        this.logger.error(`Unexpected error fetching user ${userId}: ${error}`);
      }
      return null; // Handle other errors gracefully
    }
  }

  private async fetchGuild(guildId: Snowflake): Promise<Guild | null> {
    try {
      return await this.client.guilds.fetch(guildId);
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10004) {
        this.logger.error(`Failed to fetch guild ${guildId}: ${error.message}`);
      } else {
        this.logger.error(
          `Unexpected error fetching guild ${guildId}: ${error}`,
        );
      }
      return null; // Handle other errors gracefully
    }
  }

  private async fetchGuildMembersFromGuild(
    guild: Guild,
    userId: Snowflake,
  ): Promise<GuildMember | null> {
    try {
      const member = await guild.members.fetch(userId);
      return member; // Return the fetched guild member
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10007) {
        this.logger.error(
          `Guild member ${userId} not found in guild ${guild.id}`,
        );
      } else {
        this.logger.error(
          `Unexpected error fetching guild member ${userId} in guild ${guild.id}: ${error}`,
        );
      }
      return null; // Handle errors gracefully
    }
  }

  private async fetchGuildMember(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<GuildMember | null> {
    const guild = await this.fetchGuild(guildId);
    if (!guild) {
      return null; // Guild not found
    }

    return this.fetchGuildMembersFromGuild(guild, userId);
  }

  private async fetchVoiceChannelFromGuild(
    guild: Guild,
    channelId: Snowflake,
  ): Promise<VoiceChannel | null> {
    try {
      const channel = await guild.channels.fetch(channelId);
      if (channel && channel.isVoiceBased()) {
        return channel as VoiceChannel;
      }
      return null; // Channel not found or not a voice channel
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10003) {
        this.logger.error(
          `Voice channel ${channelId} not found in guild ${guild.id}: ${error.message}`,
        );
      } else {
        this.logger.error(
          `Unexpected error fetching voice channel ${channelId} in guild ${guild.id}: ${error}`,
        );
      }
      return null;
    }
  }

  async isUserExistInGuild(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<boolean> {
    const guildMember = await this.fetchGuildMember(guildId, userId);
    return guildMember ? true : false;
  }

  async sendMessageToUser(params: {
    userId: Snowflake;
    message: string;
  }): Promise<void> {
    const user = await this.fetchUser(params.userId);
    if (!user) {
      return; // User not found
    }
    await user.send(params.message);
    return;
  }

  async isInVoiceChannel(
    guildId: Snowflake,
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<boolean> {
    const guild = await this.fetchGuild(guildId);
    if (!guild) {
      return false;
    }

    const voiceChannel = await this.fetchVoiceChannelFromGuild(
      guild,
      channelId,
    );
    if (!voiceChannel) {
      return false;
    }

    return voiceChannel.members.has(userId);
  }
}

export const DiscordCommunicationPlatformProvider = {
  provide: ICommunicationPlatformSymbol,
  useClass: DiscordCommunicationPlatform,
};
