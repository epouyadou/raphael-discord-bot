import { BotError } from '@domain/core/primitives/BotError';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { VoiceChannelConnectionTrackingOrderDomainErrors } from '@domain/voice-channel-connection-tracking/VoiceChannelConnectionTrackingOrderDomainErrors';
import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DeregisterVoiceChannelConnectionTrackingCommand } from './DeregisterVoiceChannelConnectionTrackingCommand';
import { DeregisterVoiceChannelConnectionTrackingCommandHandler } from './DeregisterVoiceChannelConnectionTrackingCommandHandler';

describe('DeregisterVoiceChannelConnectionTrackingCommandHandler', () => {
  let commandHandler: DeregisterVoiceChannelConnectionTrackingCommandHandler;
  let roleBasedVCCTRepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository;
  let userBasedVCCTRepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository;

  const testingRepositoryCalls = async function (params: {
    command: DeregisterVoiceChannelConnectionTrackingCommand;
    expectedNumberOfCallsForRoleBasedVCCTORepository: number;
    expectedNumberOfCallsForUserBasedVCCTORepository: number;
    shouldDatabaseDeleteAnything?: boolean;
    shouldDatabaseThrowError?: boolean;
  }): Promise<void> {
    expect(
      params.shouldDatabaseDeleteAnything === true &&
        params.shouldDatabaseThrowError === true,
    ).toBe(false);

    let roleBasedVCCTORepositoryDeleteSpy: jest.SpyInstance;
    let userBasedVCCTORepositoryDeleteSpy: jest.SpyInstance;
    let expectedError: BotError | undefined = undefined;

    if (params.shouldDatabaseThrowError) {
      roleBasedVCCTORepositoryDeleteSpy = jest
        .spyOn(roleBasedVCCTRepository, 'delete')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Database error')),
        );
      userBasedVCCTORepositoryDeleteSpy = jest
        .spyOn(userBasedVCCTRepository, 'delete')
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Database error')),
        );
      expectedError =
        VoiceChannelConnectionTrackingOrderDomainErrors.FailedToDeregister;
    } else {
      roleBasedVCCTORepositoryDeleteSpy = jest
        .spyOn(roleBasedVCCTRepository, 'delete')
        .mockImplementationOnce(() =>
          Promise.resolve(params.shouldDatabaseDeleteAnything ? true : false),
        );
      userBasedVCCTORepositoryDeleteSpy = jest
        .spyOn(userBasedVCCTRepository, 'delete')
        .mockImplementationOnce(() =>
          Promise.resolve(params.shouldDatabaseDeleteAnything ? true : false),
        );
      if (!params.shouldDatabaseDeleteAnything) {
        expectedError =
          VoiceChannelConnectionTrackingOrderDomainErrors.NotFound;
      }
    }

    const result = await commandHandler.handle(params.command);

    expect(roleBasedVCCTORepositoryDeleteSpy).toHaveBeenCalledTimes(
      params.expectedNumberOfCallsForRoleBasedVCCTORepository,
    );
    expect(userBasedVCCTORepositoryDeleteSpy).toHaveBeenCalledTimes(
      params.expectedNumberOfCallsForUserBasedVCCTORepository,
    );

    if (expectedError) {
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe(expectedError);
      return;
    }

    expect(result.isSuccess()).toBe(true);
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        DeregisterVoiceChannelConnectionTrackingCommandHandler,
        UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
        RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
      ],
    }).compile();

    commandHandler =
      moduleRef.get<DeregisterVoiceChannelConnectionTrackingCommandHandler>(
        DeregisterVoiceChannelConnectionTrackingCommandHandler,
      );

    roleBasedVCCTRepository =
      moduleRef.get<IRoleBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );

    userBasedVCCTRepository =
      moduleRef.get<IUserBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );
  });

  describe(`Deregistering user's voice channel connection tracking order (VCCTO)`, () => {
    describe(`WHEN no error`, () => {
      describe('AND WHEN it exists in the database', () => {
        describe(`AND WHEN it's role based`, () => {
          it(`IT SHOULD return success after calling the roleBasedVCCTORepository once`, async () => {
            const command = {
              guildId: '614661318264842208',
              trackerGuildMemberId: '514661318264842208',
              mentionableId: '314661318264842208',
              isRoleBased: true,
              isUserBased: false,
            };

            await testingRepositoryCalls({
              command,
              expectedNumberOfCallsForRoleBasedVCCTORepository: 1,
              expectedNumberOfCallsForUserBasedVCCTORepository: 0,
            });
          });
        });
        describe(`AND WHEN it's user based`, () => {
          it(`IT SHOULD return success after calling the userBasedVCCTORepository once`, async () => {
            const command = {
              guildId: '614661318264842208',
              trackerGuildMemberId: '514661318264842208',
              mentionableId: '314661318264842208',
              isRoleBased: false,
              isUserBased: true,
            };

            await testingRepositoryCalls({
              command,
              expectedNumberOfCallsForRoleBasedVCCTORepository: 0,
              expectedNumberOfCallsForUserBasedVCCTORepository: 1,
            });
          });
        });
      });
      describe(`AND WHEN it doesn't exists in the database`, () => {
        describe(`AND WHEN it's role based`, () => {
          it(`IT SHOULD return failure with the error NotFound after calling the roleBasedVCCTORepository once`, async () => {
            const command = {
              guildId: '614661318264842208',
              trackerGuildMemberId: '514661318264842208',
              mentionableId: '314661318264842208',
              isRoleBased: true,
              isUserBased: false,
            };

            await testingRepositoryCalls({
              command,
              expectedNumberOfCallsForRoleBasedVCCTORepository: 1,
              expectedNumberOfCallsForUserBasedVCCTORepository: 0,
              shouldDatabaseDeleteAnything: false,
            });
          });
        });
        describe(`AND WHEN it's user based`, () => {
          it(`IT SHOULD return failure with the error NotFound after calling the userBasedVCCTORepository once`, async () => {
            const command = {
              guildId: '614661318264842208',
              trackerGuildMemberId: '514661318264842208',
              mentionableId: '314661318264842208',
              isRoleBased: false,
              isUserBased: true,
            };

            await testingRepositoryCalls({
              command,
              expectedNumberOfCallsForRoleBasedVCCTORepository: 0,
              expectedNumberOfCallsForUserBasedVCCTORepository: 1,
              shouldDatabaseDeleteAnything: false,
            });
          });
        });
      });
    });
    describe('AND WHEN it throw an error', () => {
      describe(`AND WHEN it's user based`, () => {
        it(`IT SHOULD return failure with the error FailedToDeregister after calling the roleBasedVCCTORepository once`, async () => {
          const command = {
            guildId: '614661318264842208',
            trackerGuildMemberId: '514661318264842208',
            mentionableId: '314661318264842208',
            isRoleBased: true,
            isUserBased: false,
          };

          await testingRepositoryCalls({
            command,
            expectedNumberOfCallsForRoleBasedVCCTORepository: 1,
            expectedNumberOfCallsForUserBasedVCCTORepository: 0,
            shouldDatabaseThrowError: true,
          });
        });
      });
      describe(`AND WHEN it's user based`, () => {
        it(`IT SHOULD return failure with the error FailedToDeregister after calling the userBasedVCCTORepository once`, async () => {
          const command = {
            guildId: '614661318264842208',
            trackerGuildMemberId: '514661318264842208',
            mentionableId: '314661318264842208',
            isRoleBased: false,
            isUserBased: true,
          };

          await testingRepositoryCalls({
            command,
            expectedNumberOfCallsForRoleBasedVCCTORepository: 0,
            expectedNumberOfCallsForUserBasedVCCTORepository: 1,
            shouldDatabaseThrowError: true,
          });
        });
      });
    });
  });
});
