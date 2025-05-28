import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import {
  IUserBasedVoiceChannelConnectionTrackingOrdersRepository,
  IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IUserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { UserBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/UserBasedVoiceChannelConnectionTrackingOrder';
import { DiscordCommunicationPlatformProvider } from '@infrastructure/communication-platform/DiscordCommunicationPlatform';
import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/UserBasedVoiceChannelConnectionTrackingOrdersRepository';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Client } from 'discord.js';
import { NotifyConnectionOfTrackedUserCommand } from './NotifyConnectionOfTrackedUserCommand';
import { NotifyConnectionOfTrackedUserCommandHandler } from './NotifyConnectionOfTrackedUserCommandHandler';

describe('NotifyConnectionOfTrackedUserCommandHandler', () => {
  let commandHandler: NotifyConnectionOfTrackedUserCommandHandler;
  let userBasedVCCTRepository: IUserBasedVoiceChannelConnectionTrackingOrdersRepository;

  let communicationPlatform: ICommunicationPlatform;
  let communicationPlatformIsInVoiceChannelSpy: jest.SpyInstance;
  let communicationPlatformIsUserExistInGuildSpy: jest.SpyInstance;
  let communicationPlatformSendMessageToUserSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        DiscordCommunicationPlatformProvider,
        UserBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
        NotifyConnectionOfTrackedUserCommandHandler,
        { provide: Client, useFactory: jest.fn() },
      ],
    }).compile();

    commandHandler = moduleRef.get<NotifyConnectionOfTrackedUserCommandHandler>(
      NotifyConnectionOfTrackedUserCommandHandler,
    );

    userBasedVCCTRepository =
      moduleRef.get<IUserBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IUserBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );

    communicationPlatform = moduleRef.get<ICommunicationPlatform>(
      ICommunicationPlatformSymbol,
    );

    communicationPlatformIsInVoiceChannelSpy = jest.spyOn(
      communicationPlatform,
      'isInVoiceChannel',
    );

    communicationPlatformIsUserExistInGuildSpy = jest.spyOn(
      communicationPlatform,
      'isUserExistInGuild',
    );

    communicationPlatformSendMessageToUserSpy = jest.spyOn(
      communicationPlatform,
      'sendMessageToUser',
    );
  });

  describe(`WHEN all the users are not connected or in the same voice channel as the tracked user`, () => {
    describe('WHEN no one tracks the user who joined the voice channel', () => {
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [];

      it(`Should not notify anyone`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackerTrackingOrders')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        const command: NotifyConnectionOfTrackedUserCommand = {
          guildId: '123456789012345678',
          guildMemberId: '234567890123456789',
          voiceChannelId: '345678901234567890',
          alreadyNotifiedGuildMemberIds: [],
        };

        const result = await commandHandler.handle(command);
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([]);
      });
    });
    describe('WHEN one user tracks the user who joined the voice channel', () => {
      const guildId = '123456789012345678';
      const trackerId = '234567890123456789';
      const trackedId = '345678901234567890';
      const voiceChannelId = '456789012345678901';
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            1,
            guildId,
            trackerId,
            trackedId,
            new Date(),
          ),
        ];

      it(`Should notify one person`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackerTrackingOrders')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
        communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
        communicationPlatformSendMessageToUserSpy.mockResolvedValue(() =>
          Promise.resolve(),
        );

        const command: NotifyConnectionOfTrackedUserCommand = {
          guildId: guildId,
          guildMemberId: trackedId,
          voiceChannelId: voiceChannelId,
          alreadyNotifiedGuildMemberIds: [],
        };

        const result = await commandHandler.handle(command);
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          1,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([trackerId]);
      });
    });
    describe('WHEN multiple users track the user who joined the voice channel', () => {
      const guildId = '123456789012345678';
      const trackerId1 = '234567890123456789';
      const trackerId2 = '345678901234567890';
      const trackerId3 = '456789012345678901';
      const trackedId = '567890123456789012';
      const voiceChannelId = '678901234567890123';
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            1,
            guildId,
            trackerId1,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            2,
            guildId,
            trackerId2,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            3,
            guildId,
            trackerId3,
            trackedId,
            new Date(),
          ),
        ];
      it(`Should notify multiple people`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackerTrackingOrders')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
        communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
        communicationPlatformSendMessageToUserSpy.mockResolvedValue(() =>
          Promise.resolve(),
        );

        const command: NotifyConnectionOfTrackedUserCommand = {
          guildId: guildId,
          guildMemberId: trackedId,
          voiceChannelId: voiceChannelId,
          alreadyNotifiedGuildMemberIds: [],
        };

        const result = await commandHandler.handle(command);
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId1,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId2,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId3,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          3,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([trackerId1, trackerId2, trackerId3]);
      });
    });
  });
  // describe(`WHEN some users are in the same voice channel as the tracked user`, () => {
  //   describe('WHEN no one tracks the user who joined the voice channel', () => {
  //     it(`Should not notify anyone`, async () => {});
  //   });
  //   describe('WHEN one user tracks the user who joined the voice channel', () => {
  //     it(`Should notify the user not connected to any or the same voice channel`, async () => {});
  //     it(`Should not notify the user who is already in the voice channel`, async () => {});
  //   });
  //   describe('WHEN multiple users track the user who joined the voice channel', () => {
  //     it(`Should notify the users not connected to any or the same voice channel`, async () => {});
  //     it(`Should not notify the users who is already in the voice channel`, async () => {});
  //   });
  // });
  // describe(`WHEN all users are in the same voice channel as the tracked user`, () => {
  //   describe('WHEN no one tracks the user who joined the voice channel', () => {
  //     it(`Should not notify anyone`, async () => {});
  //   });
  //   describe('WHEN one user tracks the user who joined the voice channel', () => {
  //     it(`Should not notify anyone`, async () => {});
  //   });
  //   describe('WHEN multiple users track the user who joined the voice channel', () => {
  //     it(`Should not notify anyone`, async () => {});
  //   });
  // });
  // describe(`WHEN there is already notified users`, () => {
  //   describe(`WHEN one of the trackers was already notified`, () => {
  //     it(`Should not notify the already notified user`, async () => {});
  //   });
  //   describe(`WHEN all of the trackers were already notified`, () => {
  //     it(`Should not notify anyone`, async () => {});
  //   });
  // });
});
