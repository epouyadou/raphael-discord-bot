import { Mentionable } from '@shared/types/mentionable';
import { Snowflake } from '@shared/types/snowflake';

export type DisableTrackingCommand = {
  guildId?: Snowflake;
  userId: Snowflake;
  mentionable?: Mentionable;
  duration?: string;
};
