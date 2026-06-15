import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('CalendarChannelMetadataService', () => {
  let service: CalendarChannelMetadataService;
  let calendarChannelRepository: jest.Mocked<
    Pick<Repository<CalendarChannelEntity>, 'find'>
  >;
  let userWorkspaceRepository: jest.Mocked<
    Pick<Repository<UserWorkspaceEntity>, 'find'>
  >;

  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const workspaceMemberFind = jest.fn();

  const buildCalendarChannel = ({
    id,
    userWorkspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
  }): CalendarChannelEntity =>
    ({
      id,
      connectedAccount: { userWorkspaceId },
    }) as CalendarChannelEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarChannelMetadataService,
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: { find: jest.fn() },
        },
        {
          provide: ConnectedAccountMetadataService,
          useValue: { getUserConnectedAccountIds: jest.fn() },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn(
              async (callback: () => Promise<unknown>) => callback(),
            ),
            getRepository: jest
              .fn()
              .mockResolvedValue({ find: workspaceMemberFind }),
          },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: { emitCustomBatchEvent: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CalendarChannelMetadataService);
    calendarChannelRepository = module.get(
      getRepositoryToken(CalendarChannelEntity),
    );
    userWorkspaceRepository = module.get(
      getRepositoryToken(UserWorkspaceEntity),
    );
  });

  describe('findChannelOwners', () => {
    it('should map calendar channels to workspace members through connected account ownership', async () => {
      calendarChannelRepository.find.mockResolvedValue([
        buildCalendarChannel({
          id: 'channel-1',
          userWorkspaceId: 'user-workspace-1',
        }),
      ]);
      userWorkspaceRepository.find.mockResolvedValue([
        { id: 'user-workspace-1', userId: 'user-1' } as UserWorkspaceEntity,
      ]);
      workspaceMemberFind.mockResolvedValue([
        { id: 'workspace-member-1', userId: 'user-1' },
      ]);

      const owners = await service.findChannelOwners({
        workspaceId,
        calendarChannelIds: ['channel-1'],
      });

      expect(owners).toEqual([
        {
          calendarChannelId: 'channel-1',
          workspaceMemberId: 'workspace-member-1',
        },
      ]);
    });

    it('should return a null workspace member when the user workspace is missing', async () => {
      calendarChannelRepository.find.mockResolvedValue([
        buildCalendarChannel({
          id: 'channel-1',
          userWorkspaceId: 'user-workspace-gone',
        }),
      ]);
      userWorkspaceRepository.find.mockResolvedValue([]);
      workspaceMemberFind.mockResolvedValue([]);

      const owners = await service.findChannelOwners({
        workspaceId,
        calendarChannelIds: ['channel-1'],
      });

      expect(owners).toEqual([
        { calendarChannelId: 'channel-1', workspaceMemberId: null },
      ]);
    });

    it('should return a null workspace member when no member exists for the user', async () => {
      calendarChannelRepository.find.mockResolvedValue([
        buildCalendarChannel({
          id: 'channel-1',
          userWorkspaceId: 'user-workspace-1',
        }),
      ]);
      userWorkspaceRepository.find.mockResolvedValue([
        { id: 'user-workspace-1', userId: 'user-1' } as UserWorkspaceEntity,
      ]);
      workspaceMemberFind.mockResolvedValue([]);

      const owners = await service.findChannelOwners({
        workspaceId,
        calendarChannelIds: ['channel-1'],
      });

      expect(owners).toEqual([
        { calendarChannelId: 'channel-1', workspaceMemberId: null },
      ]);
    });

    it('should return an empty array for an empty calendarChannelIds filter without querying', async () => {
      const owners = await service.findChannelOwners({
        workspaceId,
        calendarChannelIds: [],
      });

      expect(owners).toEqual([]);
      expect(calendarChannelRepository.find).not.toHaveBeenCalled();
    });

    it('should query all workspace channels when calendarChannelIds is omitted', async () => {
      calendarChannelRepository.find.mockResolvedValue([
        buildCalendarChannel({
          id: 'channel-1',
          userWorkspaceId: 'user-workspace-1',
        }),
        buildCalendarChannel({
          id: 'channel-2',
          userWorkspaceId: 'user-workspace-1',
        }),
      ]);
      userWorkspaceRepository.find.mockResolvedValue([
        { id: 'user-workspace-1', userId: 'user-1' } as UserWorkspaceEntity,
      ]);
      workspaceMemberFind.mockResolvedValue([
        { id: 'workspace-member-1', userId: 'user-1' },
      ]);

      const owners = await service.findChannelOwners({ workspaceId });

      expect(calendarChannelRepository.find).toHaveBeenCalledWith({
        where: { workspaceId },
        relations: { connectedAccount: true },
      });
      expect(owners).toEqual([
        {
          calendarChannelId: 'channel-1',
          workspaceMemberId: 'workspace-member-1',
        },
        {
          calendarChannelId: 'channel-2',
          workspaceMemberId: 'workspace-member-1',
        },
      ]);
    });
  });
});
