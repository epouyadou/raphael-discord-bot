import {
  ICommunicationPlatform,
  ICommunicationPlatformSymbol,
} from '@application/abstractions/communication-platform/ICommunicationPlatform';
import {
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepository,
  IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
} from '@domain/voice-channel-connection-tracking/IRoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { RoleBasedVoiceChannelConnectionTrackingOrder } from '@domain/voice-channel-connection-tracking/RoleBasedVoiceChannelConnectionTrackingOrder';
import { DiscordCommunicationPlatformProvider } from '@infrastructure/communication-platform/DiscordCommunicationPlatform';
import { postgresProvider } from '@infrastructure/database/postgres/postgres.provider';
import { RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider } from '@infrastructure/repositories/RoleBasedVoiceChannelConnectionTrackingOrdersRepository';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Snowflake } from '@shared/types/snowflake';
import { Client } from 'discord.js';
import { NotifyConnectionOfUserWithTrackedRoleCommand } from './NotifyConnectionOfUserWithTrackedRoleCommand';
import { NotifyConnectionOfUserWithTrackedRoleCommandHandler } from './NotifyConnectionOfUserWithTrackedRoleCommandHandler';

describe('NotifyConnectionOfUserWithTrackedRoleCommandHandler', () => {
  let commandHandler: NotifyConnectionOfUserWithTrackedRoleCommandHandler;

  let roleBasedVCCTRepository: IRoleBasedVoiceChannelConnectionTrackingOrdersRepository;
  let deleteAllOfTrackerSpy: jest.SpyInstance;
  let saveSpy: jest.SpyInstance;

  let communicationPlatform: ICommunicationPlatform;
  let communicationPlatformIsInVoiceChannelSpy: jest.SpyInstance;
  let communicationPlatformIsUserExistInGuildSpy: jest.SpyInstance;
  let communicationPlatformSendMessageToUserSpy: jest.SpyInstance;
  let communicationPlatformHasPermissionToAccessTheVoiceChannelSpy: jest.SpyInstance;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        postgresProvider,
        DiscordCommunicationPlatformProvider,
        RoleBasedVoiceChannelConnectionTrackingOrdersRepositoryProvider,
        NotifyConnectionOfUserWithTrackedRoleCommandHandler,
        { provide: Client, useFactory: jest.fn() },
      ],
    }).compile();

    commandHandler =
      moduleRef.get<NotifyConnectionOfUserWithTrackedRoleCommandHandler>(
        NotifyConnectionOfUserWithTrackedRoleCommandHandler,
      );

    roleBasedVCCTRepository =
      moduleRef.get<IRoleBasedVoiceChannelConnectionTrackingOrdersRepository>(
        IRoleBasedVoiceChannelConnectionTrackingOrdersRepositorySymbol,
      );

    deleteAllOfTrackerSpy = jest.spyOn(
      roleBasedVCCTRepository,
      'deleteAllOfTracker',
    );
    deleteAllOfTrackerSpy.mockResolvedValue(() => Promise.resolve());

    saveSpy = jest.spyOn(roleBasedVCCTRepository, 'save');
    saveSpy.mockResolvedValue(() => Promise.resolve(true));

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
    communicationPlatformSendMessageToUserSpy.mockResolvedValue(() =>
      Promise.resolve(),
    );

    communicationPlatformHasPermissionToAccessTheVoiceChannelSpy = jest.spyOn(
      communicationPlatform,
      'hasPermissionToAccessTheVoiceChannel',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`When a user with a tracked role connects to a voice channel`, () => {
    const guildId = '123456789012345678';
    const guildMemberId = '234567890123456789';
    const voiceChannelId = '345678901234567890';
    const guildMemberRoleIds: Snowflake[] = [
      '456789012345678901',
      '567890123456789012',
    ];
    const alreadyNotifiedGuildMemberIds: Snowflake[] = [];
    let roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy: jest.SpyInstance;

    beforeEach(() => {
      roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy = jest
        .spyOn(roleBasedVCCTRepository, 'findAllByTrackedTrackedRoles')
        .mockResolvedValue([
          RoleBasedVoiceChannelConnectionTrackingOrder.create(
            1,
            guildId,
            '678901234567890123',
            guildMemberRoleIds[0],
            new Date(),
          ),
        ]);
    });

    it('should notify all users not in same voice channel with the same tracked role', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds,
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        true,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformIsInVoiceChannelSpy).toHaveBeenCalledWith(
        guildId,
        voiceChannelId,
        '678901234567890123',
      );
      expect(communicationPlatformSendMessageToUserSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '678901234567890123',
        }),
      );
    });

    it('should not notify users who are already in the voice channel', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds,
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(true);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        true,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformIsInVoiceChannelSpy).toHaveBeenCalledWith(
        guildId,
        voiceChannelId,
        '678901234567890123',
      );
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });

    it('should not notify users who have already been notified', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds: ['678901234567890123'],
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        true,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });

    it('should handle case where user does not exist in guild', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds,
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(false);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        true,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformIsInVoiceChannelSpy).toHaveBeenCalledWith(
        guildId,
        voiceChannelId,
        '678901234567890123',
      );
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });

    it('should not notify the user who is connecting', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId: '678901234567890123',
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds,
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(true);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        true,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });

    it('should not notify if no tracking orders found for the roles', async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds: ['999999999999999999'], // Non-existent role
        alreadyNotifiedGuildMemberIds,
      };

      roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy.mockResolvedValue(
        [],
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, command.guildMemberRoleIds);
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });

    it(`Should not notify users if they do not have permission to access the voice channel`, async () => {
      const command: NotifyConnectionOfUserWithTrackedRoleCommand = {
        guildId,
        guildMemberId,
        voiceChannelId,
        guildMemberRoleIds,
        alreadyNotifiedGuildMemberIds,
      };

      communicationPlatformIsInVoiceChannelSpy.mockResolvedValue(false);
      communicationPlatformIsUserExistInGuildSpy.mockResolvedValue(true);
      communicationPlatformHasPermissionToAccessTheVoiceChannelSpy.mockResolvedValue(
        false,
      );

      await commandHandler.handle(command);

      expect(
        roleBasedVCCTRepositoryFindAllByTrackedTrackedRolesSpy,
      ).toHaveBeenCalledWith(guildId, guildMemberRoleIds);
      expect(communicationPlatformSendMessageToUserSpy).not.toHaveBeenCalled();
    });
  });
});
