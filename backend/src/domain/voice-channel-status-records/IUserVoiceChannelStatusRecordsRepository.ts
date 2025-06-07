import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export const IUserVoiceChannelStatusRecordsRepositorySymbol = Symbol(
  'IUserVoiceChannelStatusRecordsRepository',
);

export interface IUserVoiceChannelStatusRecordsRepository {
  save(voiceChannelStatusRecord: VoiceChannelStatusRecord): Promise<void>;
}
