import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { MachineTimeProvider } from '@infrastructure/common/MachineTime';
import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand';
import { RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler';

describe('RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler', () => {
  let commandHandler: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler;

  let userBasedVCCTRepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository;
  let saveSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
        RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
        MachineTimeProvider,
      ],
    }).compile();

    commandHandler =
      moduleRef.get<RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler>(
        RegisterUserBasedVoiceChannelConnexionTrackingOrderCommandHandler,
      );

    userBasedVCCTRepository =
      moduleRef.get<IUserBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );
    saveSpy = jest.spyOn(userBasedVCCTRepository, 'save');
    saveSpy.mockResolvedValue(() => Promise.resolve());
  });

  it('should register a new role-based voice channel connection tracking order', async () => {
    const command: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: '01234567890123456789',
        trackerGuildMemberId: '1234567890123456789',
        trackedGuildMemberId: '234567890123456789',
      };

    const isAlreadyTracked = false;
    userBasedVCCTRepository.exists = jest
      .fn()
      .mockResolvedValue(isAlreadyTracked);

    const result = await commandHandler.handle(command);

    expect(result.isSuccess()).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should return failure if the role is already tracked', async () => {
    const command: RegisterUserBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: '01234567890123456789',
        trackerGuildMemberId: '1234567890123456789',
        trackedGuildMemberId: '234567890123456789',
      };

    const isAlreadyTracked = true;
    jest
      .spyOn(userBasedVCCTRepository, 'exists')
      .mockResolvedValue(isAlreadyTracked);

    const result = await commandHandler.handle(command);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeDefined();
  });
});
