import { Logger } from '@nestjs/common';
import { GuildMember, User } from 'discord.js';
import { Context, Options, SlashCommandContext, Subcommand } from 'necord';
import { NotifyCommandsDecorator } from '../notify-commands.service';
import { NotifyMeOnVoiceChannelConnectionDto } from './NotifyMeOnVoiceChannelConnection.dto';
import { NotifyMeOnVoiceChannelConnectionService } from './NotifyMeOnVoiceChannelConnection.service';

@NotifyCommandsDecorator()
export class NotifyMeOnVoiceChannelConnectionCommand {
  private readonly logger = new Logger(
    NotifyMeOnVoiceChannelConnectionCommand.name,
  );

  constructor(
    private notifyMeOnVoiceChannelConnectionService: NotifyMeOnVoiceChannelConnectionService,
  ) {}

  @Subcommand({
    name: 'me',
    description: 'Notify me when somebody is connecting in a voice channel',
  })
  public async onNotifyMe(
    @Context() [interaction]: SlashCommandContext,
    @Options() { mentionable }: NotifyMeOnVoiceChannelConnectionDto,
  ) {
    const member = interaction.member as GuildMember;

    if (mentionable instanceof User || interaction.guild === null) {
      await interaction.reply({
        content: 'You cannot track non guild members.',
        ephemeral: true,
      });
      return;
    }

    // Disable the following if statement to test the command with yourself
    if (mentionable.id === member.id) {
      await interaction.reply({
        content: 'You cannot track yourself.',
        ephemeral: true,
      });
      return;
    }

    if (mentionable instanceof GuildMember) {
      await this.notifyMeOnVoiceChannelConnectionService.trackUser(
        member.id,
        mentionable.id,
        interaction.guildId!,
      );
      this.logger.log(
        `User ${member.id} is tracking user ${mentionable.id} in guild ${interaction.guildId}`,
      );
      await interaction.reply({
        content: `You will be notified when ${mentionable.displayName} connects to a vocal channel.`,
        ephemeral: true,
      });
    } else {
      await this.notifyMeOnVoiceChannelConnectionService.trackRole(
        member.id,
        mentionable.id,
        interaction.guildId!,
      );
      this.logger.log(
        `User ${member.id} is tracking role ${mentionable.id} in guild ${interaction.guildId}`,
      );
      await interaction.reply({
        content: `You will be notified when someone with the ${mentionable.name} role connects to a vocal channel.`,
        ephemeral: true,
      });
    }
  }
}
