import { GuildMember, Role, User } from 'discord.js';
import { MentionableOption } from 'necord';

export class NotifyMeOnVoiceChannelConnectionDto {
  @MentionableOption({
    name: 'mention',
    description: 'The guild member, or role to track in the voice channel',
    required: true,
  })
  mentionable: GuildMember | Role | User;
}
