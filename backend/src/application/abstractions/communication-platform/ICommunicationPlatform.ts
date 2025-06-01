import { Snowflake } from '@shared/types/snowflake';

export const ICommunicationPlatformSymbol = Symbol('ICommunicationPlatform');

export interface ICommunicationPlatform {
  isUserExistInGuild(guildId: Snowflake, userId: Snowflake): Promise<boolean>;
  sendMessageToUser(params: {
    userId: Snowflake;
    message: string;
  }): Promise<void>;
  isInVoiceChannel(
    guildId: Snowflake,
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<boolean>;
  getUsersByRole(guildId: Snowflake, roleId: Snowflake): Promise<Snowflake[]>;
  hasPermissionToAccessTheVoiceChannel(
    guildId: Snowflake,
    channelId: Snowflake,
    userId: Snowflake,
  ): Promise<boolean>;
}
