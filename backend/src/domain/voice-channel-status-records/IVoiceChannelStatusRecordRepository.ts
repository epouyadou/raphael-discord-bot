import { VoiceChannelStatusRecord } from './VoiceChannelStatusRecord';

export interface IVoiceChannelStatusRecordRepository {
  save(voiceChannelStatusRecord: VoiceChannelStatusRecord): Promise<void>;
}
