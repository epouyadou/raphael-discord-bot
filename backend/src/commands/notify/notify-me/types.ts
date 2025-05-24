export type UserTrackingOrder = {
  user_id: string;
  guild_id: string;
  guild_member_id: string;
};
export type RoleTrackingOrder = {
  user_id: string;
  guild_id: string;
  guild_role_id: string;
};
export type VoiceChannelStatusRecord = {
  guild_member_id: string;
  guild_id: string;
  guild_channel_id: string;
  is_connected: boolean;
  created_at: Date;
};
