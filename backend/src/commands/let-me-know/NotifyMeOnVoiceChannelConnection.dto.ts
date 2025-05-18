import { GuildChannel, GuildMember, Role, User } from 'discord.js';
import { ChannelOption, MentionableOption } from 'necord';

export class NotifyMeOnVoiceChannelConnectionDto {
  @MentionableOption({
    name: 'mentionable',
    description: 'The guild member, or role to track in the voice channel',
    required: true,
  })
  mentionable: GuildMember | Role | User;

  @ChannelOption({
    name: 'channel',
    description: 'The voice channel to track',
    required: true,
  })
  channel: GuildChannel;
}
