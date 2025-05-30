import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { MachineTimeProvider } from '@infrastructure/common/MachineTime';
import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand } from './RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand';
import { RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler } from './RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler';

describe('RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler', () => {
  let commandHandler: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler;

  let roleBasedVCCTRepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository;
  let saveSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
        RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
        MachineTimeProvider,
      ],
    }).compile();

    commandHandler =
      moduleRef.get<RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler>(
        RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommandHandler,
      );

    roleBasedVCCTRepository =
      moduleRef.get<IRoleBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );
    saveSpy = jest.spyOn(roleBasedVCCTRepository, 'save');
    saveSpy.mockResolvedValue(() => Promise.resolve());
  });

  it('should register a new role-based voice channel connection tracking order', async () => {
    const command: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: '01234567890123456789',
        trackerGuildMemberId: '1234567890123456789',
        trackedGuildRoleId: '234567890123456789',
      };

    const isAlreadyTracked = false;
    roleBasedVCCTRepository.exists = jest
      .fn()
      .mockResolvedValue(isAlreadyTracked);

    const result = await commandHandler.handle(command);

    expect(result.isSuccess()).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should return failure if the role is already tracked', async () => {
    const command: RegisterRoleBasedVoiceChannelConnexionTrackingOrderCommand =
      {
        guildId: '01234567890123456789',
        trackerGuildMemberId: '1234567890123456789',
        trackedGuildRoleId: '234567890123456789',
      };

    const isAlreadyTracked = true;
    jest
      .spyOn(roleBasedVCCTRepository, 'exists')
      .mockResolvedValue(isAlreadyTracked);

    const result = await commandHandler.handle(command);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeDefined();
  });
});
