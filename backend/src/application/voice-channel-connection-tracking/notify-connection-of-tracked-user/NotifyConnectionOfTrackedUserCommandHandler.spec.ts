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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`WHEN all the users are not connected or in the same voice channel as the tracked user`, () => {
    describe('WHEN no one tracks the user who joined the voice channel', () => {
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [];

      it(`Should not notify anyone`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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
  describe(`WHEN some users are in the same voice channel as the tracked user`, () => {
    const guildId = '123456789012345678';
    const voiceChannelId = '890123456789012345';

    const userId1 = '234567890123456789';
    const userId2 = '345678901234567890';
    const userId3 = '456789012345678901';
    const userId4 = '567890123456789012';
    const userId5 = '678901234567890123';
    const trackedId = '789012345678901234';
    const idsOfUserInTheSameChannel = [userId2, userId5];
    const idsOfUserNotInTheSameChannel = [userId1, userId3, userId4];

    describe('WHEN no one tracks the user who joined the voice channel', () => {
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [];

      it(`Should not notify anyone`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        const command: NotifyConnectionOfTrackedUserCommand = {
          guildId: guildId,
          guildMemberId: trackedId,
          voiceChannelId: voiceChannelId,
          alreadyNotifiedGuildMemberIds: [],
        };

        const result = await commandHandler.handle(command);
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([]);
      });
    });
    describe('WHEN one user tracks the user who joined the voice channel', () => {
      it(`Should notify the user not connected to any or the same voice channel`, async () => {
        const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
          [
            UserBasedVoiceChannelConnectionTrackingOrder.create(
              1,
              guildId,
              userId1,
              trackedId,
              new Date(),
            ),
          ];

        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockImplementation(
          (guildId, channelId, userId: string) => {
            return Promise.resolve(idsOfUserInTheSameChannel.includes(userId));
          },
        );
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
            userId: userId1,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          1,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([userId1]);
      });
      it(`Should not notify the user who is already in the voice channel`, async () => {
        const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
          [
            UserBasedVoiceChannelConnectionTrackingOrder.create(
              1,
              guildId,
              userId2,
              trackedId,
              new Date(),
            ),
          ];

        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockImplementation(
          (guildId, channelId, userId: string) => {
            return Promise.resolve(idsOfUserInTheSameChannel.includes(userId));
          },
        );
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
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalled();
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([]);
      });
    });
    describe('WHEN multiple users track the user who joined the voice channel', () => {
      const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
        [
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            1,
            guildId,
            userId1,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            2,
            guildId,
            userId2,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            3,
            guildId,
            userId3,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            4,
            guildId,
            userId4,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            5,
            guildId,
            userId5,
            trackedId,
            new Date(),
          ),
        ];

      it(`Should notify the users connected to none or a different voice channel`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockImplementation(
          (guildId, channelId, userId: string) => {
            return Promise.resolve(idsOfUserInTheSameChannel.includes(userId));
          },
        );
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
            userId: userId1,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId2,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId3,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId4,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId5,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          3,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual(idsOfUserNotInTheSameChannel);
      });
      it(`Should not notify the users who is already in the voice channel`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockImplementation(
          (guildId, channelId, userId: string) => {
            return Promise.resolve(idsOfUserInTheSameChannel.includes(userId));
          },
        );
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
            userId: userId1,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId2,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId3,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId4,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: userId5,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          3,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([userId1, userId3, userId4]);
      });
    });
  });
  describe(`WHEN all users are in the same voice channel as the tracked user`, () => {
    describe('WHEN no one tracks the user who joined the voice channel', () => {
      it(`Should not notify anyone`, async () => {
        const mockResultOfFindAllByTrackerTrackingOrders: UserBasedVoiceChannelConnectionTrackingOrder[] =
          [];

        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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

      it(`Should not notify anyone`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(true);
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
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalled();
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([]);
      });
    });
    describe('WHEN multiple users track the user who joined the voice channel', () => {
      const guildId = '123456789012345678';
      const trackerId1 = '234567890123456789';
      const trackerId2 = '345678901234567890';
      const trackerId3 = '456789012345678901';
      const trackerId4 = '567890123456789012';
      const trackerId5 = '678901234567890123';
      const trackedId = '767890123456789012';
      const voiceChannelId = '878901234567890123';
      const idsOfUserInTheSameChannel = [
        trackerId1,
        trackerId3,
        trackerId4,
        trackerId5,
      ];
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
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            4,
            guildId,
            trackerId4,
            trackedId,
            new Date(),
          ),
          UserBasedVoiceChannelConnectionTrackingOrder.create(
            5,
            guildId,
            trackerId5,
            trackedId,
            new Date(),
          ),
        ];

      it(`Should not notify anyone`, async () => {
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
          .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

        communicationPlatformIsInVoiceChannelSpy.mockImplementation(
          (guildId, channelId, userId: string) => {
            return Promise.resolve(idsOfUserInTheSameChannel.includes(userId));
          },
        );
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
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId1,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId2,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId3,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId4,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId5,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          1,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([trackerId2]);
      });
    });
  });
  describe(`WHEN there is already notified users`, () => {
    const guildId = '123456789012345678';
    const trackerId1 = '234567890123456789';
    const trackerId2 = '345678901234567890';
    const trackerId3 = '456789012345678901';
    const trackedId = '545678901234567890';
    const voiceChannelId = '656789012345678901';

    describe(`WHEN one of the trackers was already notified`, () => {
      it(`Should not notify the already notified user`, async () => {
        const idOfTheTrackerAlreadyNotified = trackerId2;
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
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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
          alreadyNotifiedGuildMemberIds: [idOfTheTrackerAlreadyNotified],
        };
        const result = await commandHandler.handle(command);
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: idOfTheTrackerAlreadyNotified,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId1,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId3,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          2,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([trackerId2, trackerId1, trackerId3]);
      });
    });
    describe(`WHEN all of the trackers were already notified`, () => {
      it(`Should not notify anyone`, async () => {
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
        jest
          .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
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
          alreadyNotifiedGuildMemberIds: [trackerId1, trackerId2, trackerId3],
        };
        const result = await commandHandler.handle(command);
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId1,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId2,
          }),
        );
        expect(
          communicationPlatformSendMessageToUserSpy,
        ).not.toHaveBeenCalledWith(
          expect.objectContaining({
            userId: trackerId3,
          }),
        );
        expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledTimes(
          0,
        );
        expect(result.isSuccess()).toBe(true);
        expect(result.value).toEqual([trackerId1, trackerId2, trackerId3]);
      });
    });
  });
  describe(`WHEN the user who joined the voice channel is not in the guild`, () => {
    it(`Should not notify anyone and delete all tracking orders of the user`, async () => {
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

      jest
        .spyOn(userBasedVCCTRepository, 'findAllByTrackedGuildMemberId')
        .mockResolvedValueOnce(mockResultOfFindAllByTrackerTrackingOrders);

      const deleteAllOfTrackerSpy = jest
        .spyOn(userBasedVCCTRepository, 'deleteAllOfTracker')
        .mockImplementation(() => Promise.resolve());

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(false);
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
      expect(communicationPlatformIsUserExistInGuildSpy).toHaveBeenCalledWith(
        guildId,
        trackerId,
      );
      expect(deleteAllOfTrackerSpy).toHaveBeenCalledWith(guildId, trackerId);
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toEqual([]);
    });
  });
});
