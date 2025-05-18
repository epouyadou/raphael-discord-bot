import { Injectable } from '@nestjs/common';
import { ChannelType, GuildMember, User } from 'discord.js';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { NotifyMeOnVoiceChannelConnectionDto } from './NotifyMeOnVoiceChannelConnection.dto';

@Injectable()
export class NotifyMeOnVoiceChannelConnectionCommand {
  @SlashCommand({
    name: 'Notify me',
    description: 'Notify me when somebody is connecting in a voice channel',
  })
  public async onNotifyMe(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable, channel }: NotifyMeOnVoiceChannelConnectionDto,
  ) {
    const member = interaction.member as GuildMember;

    if (mentionable instanceof User) {
      await interaction.reply({
        content: 'You cannot track non guild members.',
        ephemeral: true,
      });
      return;
    }

    if (channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: 'You can only track guild voice channels.',
        ephemeral: true,
      });
      return;
    }

    if (mentionable.id === member.id) {
      await interaction.reply({
        content: 'You cannot track yourself.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: `You will be notified when ${mentionable.toString()} connects to ${channel.name}.`,
      ephemeral: true,
    });
  }
}
