import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  IUserVoiceChannelStatusRecordsRepository,
  IUserVoiceChannelStatusRecordsRepositorySymbol,
} from '../../../domain/voice-channel-status-records/IUserVoiceChannelStatusRecordsRepository';
import { UserVoiceChannelStatusRecordsRepositoryProvider } from '../../../infrastructure/repositories/UserVoiceChannelStatusRecordsRepository';
import { SaveUserVoiceChannelStatusCommandHandler } from './SaveUserVoiceChannelStatusCommandHandler';

describe('SaveUserVoiceChannelStatusCommandHandler', () => {
  let commandHandler: SaveUserVoiceChannelStatusCommandHandler;
  let userVoiceChannelStatusRecordsRepository: IUserVoiceChannelStatusRecordsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        SaveUserVoiceChannelStatusCommandHandler,
        UserVoiceChannelStatusRecordsRepositoryProvider,
      ],
    }).compile();

    commandHandler = moduleRef.get<SaveUserVoiceChannelStatusCommandHandler>(
      SaveUserVoiceChannelStatusCommandHandler,
    );

    userVoiceChannelStatusRecordsRepository =
      moduleRef.get<IUserVoiceChannelStatusRecordsRepository>(
        IUserVoiceChannelStatusRecordsRepositorySymbol,
      );
  });

  describe('handle', () => {
    it('should save user voice channel status when user join channel', async () => {
      const command = {
        guildId: '614661318264842208',
        guildMemberId: '514661318264842208',
        fromChannelId: null,
        toChannelId: '314661318264842208',
      };

      const saveSpy = jest
        .spyOn(userVoiceChannelStatusRecordsRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await commandHandler.handle(command);

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should save user voice channel status when user switch channel', async () => {
      const command = {
        guildId: '614661318264842208',
        guildMemberId: '514661318264842208',
        fromChannelId: '414661318264842208',
        toChannelId: '314661318264842208',
      };

      const saveSpy = jest
        .spyOn(userVoiceChannelStatusRecordsRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await commandHandler.handle(command);

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });

    it('should save user voice channel status when user leave channel', async () => {
      const command = {
        guildId: '614661318264842208',
        guildMemberId: '514661318264842208',
        fromChannelId: '414661318264842208',
        toChannelId: 'null',
      };

      const saveSpy = jest
        .spyOn(userVoiceChannelStatusRecordsRepository, 'save')
        .mockImplementationOnce(() => Promise.resolve());

      await commandHandler.handle(command);

      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
