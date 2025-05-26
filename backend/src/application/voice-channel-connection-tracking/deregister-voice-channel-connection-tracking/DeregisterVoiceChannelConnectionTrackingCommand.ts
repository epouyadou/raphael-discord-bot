export type DeregisterVoiceChannelConnectionTrackingCommand = {
  isRoleBased: boolean;
  isUserBased: boolean;
  guildId: string;
  mentionableId: string;
  trackerGuildMemberId: string;
};
