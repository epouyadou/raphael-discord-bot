import { OrderingType } from '@domain/core/primitives/OrderingType';
import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export const IUserVoiceChannelStatusRecordsRepositorySymbol = Symbol(
  'IUserVoiceChannelStatusRecordsRepository',
);

export interface IUserVoiceChannelStatusRecordsRepository {
  fetchAllFromUserId(
    guildId: string,
    guildMemberId: string,
    cursor: number,
    orderBy: OrderingType,
    limit: number,
  ): Promise<VoiceChannelStatusRecord[]>;

  fetchLastFromUserIds(
    guildId: string,
    guildMemberIds: string[],
    orderBy: OrderingType,
    limit: number,
  ): Promise<VoiceChannelStatusRecord[]>;

  save(voiceChannelStatusRecord: VoiceChannelStatusRecord): Promise<void>;
}
