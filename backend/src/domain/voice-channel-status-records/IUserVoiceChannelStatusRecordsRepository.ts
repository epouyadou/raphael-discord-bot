import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export interface IUserVoiceChannelStatusRecordsRepository {
  save(voiceChannelStatusRecord: VoiceChannelStatusRecord): Promise<void>;
}

export const IUserVoiceChannelStatusRecordsRepositorySymbol = Symbol(
  'IUserVoiceChannelStatusRecordsRepository',
);
