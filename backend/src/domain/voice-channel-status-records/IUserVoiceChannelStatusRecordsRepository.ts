import { OrderingType } from '@domain/core/primitives/OrderingType';
import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export const IUserVoiceChannelStatusRecordsRepositorySymbol = Symbol(
  'IUserVoiceChannelStatusRecordsRepository',
);

export interface IUserVoiceChannelStatusRecordsRepository {
  getFromUserIdAndGuildId(
    guildId: string,
    guildMemberId: string,
    cursor: number,
    orderBy: OrderingType,
    limit: number,
  ): Promise<VoiceChannelStatusRecord[]>;

  save(voiceChannelStatusRecord: VoiceChannelStatusRecord): Promise<void>;
}
