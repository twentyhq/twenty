import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

describe('MatchParticipantService', () => {
  let service: MatchParticipantService<MessageParticipantWorkspaceEntity>;
  let twentyORMGlobalManager: TwentyORMGlobalManager;
  let workspaceEventEmitter: WorkspaceEventEmitter;
  let scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory;

  let mockMessageParticipantRepository: {
    find: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
    formatResult: jest.Mock;
  };
  let mockCalendarEventParticipantRepository: {
    find: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
    formatResult: jest.Mock;
  };
  let mockPersonRepository: {
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
    formatResult: jest.Mock;
  };
  let mockWorkspaceMemberRepository: {
    find: jest.Mock;
  };
  let mockTransactionManager: WorkspaceEntityManager;

  const mockWorkspaceId = 'test-workspace-id';

  beforeEach(async () => {
    mockMessageParticipantRepository = {
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        withDeleted: jest.fn().mockReturnThis(),
      }),
      formatResult: jest.fn(),
    };

    mockCalendarEventParticipantRepository = {
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        withDeleted: jest.fn().mockReturnThis(),
      }),
      formatResult: jest.fn(),
    };

    mockPersonRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        withDeleted: jest.fn().mockReturnThis(),
      }),
      formatResult: jest.fn(),
    };

    mockWorkspaceMemberRepository = {
      find: jest.fn(),
    };

    mockTransactionManager = {} as WorkspaceEntityManager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchParticipantService,
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest
              .fn()
              .mockImplementation((_workspaceId, entityName) => {
                switch (entityName) {
                  case 'messageParticipant':
                    return mockMessageParticipantRepository;
                  case 'calendarEventParticipant':
                    return mockCalendarEventParticipantRepository;
                  case 'person':
                    return mockPersonRepository;
                  case 'workspaceMember':
                    return mockWorkspaceMemberRepository;
                  default:
                    return {};
                }
              }),
          },
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: {
            emitCustomBatchEvent: jest.fn(),
          },
        },
        {
          provide: ScopedWorkspaceContextFactory,
          useValue: {
            create: jest.fn().mockReturnValue({
              workspaceId: mockWorkspaceId,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<
      MatchParticipantService<MessageParticipantWorkspaceEntity>
    >(MatchParticipantService);
    twentyORMGlobalManager = module.get<TwentyORMGlobalManager>(
      TwentyORMGlobalManager,
    );
    workspaceEventEmitter = module.get<WorkspaceEventEmitter>(
      WorkspaceEventEmitter,
    );
    scopedWorkspaceContextFactory = module.get<ScopedWorkspaceContextFactory>(
      ScopedWorkspaceContextFactory,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchParticipants', () => {
    const mockParticipants = [
      {
        id: 'participant-1',
        handle: 'test-1@example.com',
        displayName: 'Test User',
      },
      {
        id: 'participant-2',
        handle: 'test-2@company.com',
        displayName: 'Contact',
      },
    ] as MessageParticipantWorkspaceEntity[];

    const mockPeople = [
      {
        id: 'person-1',
        emails: {
          primaryEmail: 'test-1@example.com',
          additionalEmails: ['test.alias@example.com'],
        },
      },
      {
        id: 'person-2',
        emails: {
          primaryEmail: 'test-2@company.com',
          additionalEmails: ['test-2.alias@company.com'],
        },
      },
    ] as PersonWorkspaceEntity[];

    const mockWorkspaceMembers = [
      {
        id: 'workspace-member-1',
        userEmail: 'test-1@example.com',
      },
    ] as WorkspaceMemberWorkspaceEntity[];

    beforeEach(() => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPeople),
        withDeleted: jest.fn().mockReturnThis(),
      };

      mockPersonRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockPersonRepository.formatResult.mockResolvedValue(mockPeople);
      mockWorkspaceMemberRepository.find.mockResolvedValue(
        mockWorkspaceMembers,
      );
      mockMessageParticipantRepository.update.mockResolvedValue({
        affected: 1,
      });
      mockMessageParticipantRepository.find.mockResolvedValue(mockParticipants);
    });

    it('should match participants with people by primary email', async () => {
      await service.matchParticipants({
        participants: mockParticipants,
        objectMetadataName: 'messageParticipant',
      });

      expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
        {
          id: expect.any(Object),
          handle: 'test-1@example.com',
        },
        {
          personId: 'person-1',
          workspaceMemberId: 'workspace-member-1',
        },
        undefined,
      );
    });

    it('should match participants with people by additional email', async () => {
      await service.matchParticipants({
        participants: mockParticipants,
        objectMetadataName: 'messageParticipant',
      });

      expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
        {
          id: expect.any(Object),
          handle: 'test-2@company.com',
        },
        {
          personId: 'person-2',
          workspaceMemberId: undefined,
        },
        undefined,
      );
    });

    it('should emit matched event after successful matching', async () => {
      await service.matchParticipants({
        participants: mockParticipants,
        objectMetadataName: 'messageParticipant',
      });

      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        'messageParticipant_matched',
        [
          {
            workspaceMemberId: null,
            participants: mockParticipants,
          },
        ],
        mockWorkspaceId,
      );
    });

    it('should work with calendar event participants', async () => {
      const calendarParticipants = [
        {
          id: 'calendar-participant-1',
          handle: 'test-1@example.com',
          displayName: 'Test User',
          isOrganizer: false,
          responseStatus: 'ACCEPTED',
        },
        {
          id: 'calendar-participant-2',
          handle: 'test-2@company.com',
          displayName: 'Contact',
          isOrganizer: false,
          responseStatus: 'ACCEPTED',
        },
      ] as CalendarEventParticipantWorkspaceEntity[];

      const calendarService =
        new MatchParticipantService<CalendarEventParticipantWorkspaceEntity>(
          workspaceEventEmitter,
          twentyORMGlobalManager,
          scopedWorkspaceContextFactory,
        );

      mockCalendarEventParticipantRepository.update.mockResolvedValue({
        affected: 1,
      });
      mockCalendarEventParticipantRepository.find.mockResolvedValue(
        calendarParticipants,
      );

      await calendarService.matchParticipants({
        participants: calendarParticipants,
        objectMetadataName: 'calendarEventParticipant',
      });

      expect(mockCalendarEventParticipantRepository.update).toHaveBeenCalled();
      expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
        'calendarEventParticipant_matched',
        expect.any(Array),
        mockWorkspaceId,
      );
    });

    it('should handle participants with no matching people or workspace members', async () => {
      mockPersonRepository.formatResult.mockResolvedValue([]);
      mockWorkspaceMemberRepository.find.mockResolvedValue([]);

      await service.matchParticipants({
        participants: mockParticipants,
        objectMetadataName: 'messageParticipant',
      });

      expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
        expect.any(Object),
        {
          personId: undefined,
          workspaceMemberId: undefined,
        },
        undefined,
      );
    });

    it('should throw error when workspace ID is not found', async () => {
      scopedWorkspaceContextFactory.create = jest.fn().mockReturnValue({
        workspaceId: null,
      });

      await expect(
        service.matchParticipants({
          participants: mockParticipants,
          objectMetadataName: 'messageParticipant',
        }),
      ).rejects.toThrow('Workspace ID is required');
    });

    it('should use transaction manager when provided', async () => {
      await service.matchParticipants({
        participants: mockParticipants,
        objectMetadataName: 'messageParticipant',
        transactionManager: mockTransactionManager,
      });

      expect(mockWorkspaceMemberRepository.find).toHaveBeenCalledWith(
        expect.any(Object),
        mockTransactionManager,
      );
    });
  });

  describe('matchParticipantsAfterPersonOrWorkspaceMemberCreation', () => {
    const mockExistingParticipants = [
      {
        id: 'participant-1',
        handle: 'test-1@example.com',
        person: null,
      },
      {
        id: 'participant-2',
        handle: 'test-2@company.com',
        person: {
          id: 'existing-person',
          emails: {
            primaryEmail: 'test-2@company.com',
            additionalEmails: ['test-2.alias@company.com'],
          },
        },
      },
    ] as MessageParticipantWorkspaceEntity[];

    beforeEach(() => {
      mockMessageParticipantRepository.find.mockResolvedValue(
        mockExistingParticipants,
      );
      mockMessageParticipantRepository.update.mockResolvedValue({
        affected: 1,
      });
    });

    describe('person matching', () => {
      it('should match unmatched participants to new person', async () => {
        await service.matchParticipantsAfterPersonCreation({
          handle: 'test-1@example.com',
          isPrimaryEmail: true,
          objectMetadataName: 'messageParticipant',
          personId: 'new-person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            id: expect.any(Object),
          },
          {
            person: {
              id: 'new-person-id',
            },
          },
        );
      });

      it('should re-match participants when new person has primary email and existing person has secondary', async () => {
        await service.matchParticipantsAfterPersonCreation({
          handle: 'test-2@company.com',
          isPrimaryEmail: true,
          objectMetadataName: 'messageParticipant',
          personId: 'new-person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            id: expect.any(Object),
          },
          {
            person: {
              id: 'new-person-id',
            },
          },
        );
      });

      it('should not re-match when existing person has primary email', async () => {
        const participantsWithPrimaryEmail = [
          {
            id: 'participant-1',
            handle: 'test-1@example.com',
            person: {
              id: 'existing-person',
              emails: {
                primaryEmail: 'test-1@example.com',
                additionalEmails: [],
              },
            },
          },
        ] as MessageParticipantWorkspaceEntity[];

        mockMessageParticipantRepository.find.mockResolvedValue(
          participantsWithPrimaryEmail,
        );

        await service.matchParticipantsAfterPersonCreation({
          handle: 'test-1@example.com',
          isPrimaryEmail: false,
          objectMetadataName: 'messageParticipant',
          personId: 'new-person-id',
        });

        expect(mockMessageParticipantRepository.update).not.toHaveBeenCalled();
      });

      it('should not re-match when new email is secondary and existing person has secondary', async () => {
        await service.matchParticipantsAfterPersonCreation({
          handle: 'test-1@example.com',
          isPrimaryEmail: false,
          objectMetadataName: 'messageParticipant',
          personId: 'new-person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledTimes(
          1,
        );
      });

      it('should emit matched event when participants are updated', async () => {
        const updatedParticipants = [mockExistingParticipants[0]];

        mockMessageParticipantRepository.find
          .mockResolvedValueOnce(mockExistingParticipants)
          .mockResolvedValueOnce(updatedParticipants);

        await service.matchParticipantsAfterPersonCreation({
          handle: 'test-1@example.com',
          isPrimaryEmail: true,
          objectMetadataName: 'messageParticipant',
          personId: 'new-person-id',
        });

        expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
          'messageParticipant_matched',
          [
            {
              workspaceId: mockWorkspaceId,
              name: 'messageParticipant_matched',
              workspaceMemberId: null,
              participants: updatedParticipants,
            },
          ],
          mockWorkspaceId,
        );
      });
    });

    describe('workspace member matching', () => {
      it('should match all participants to workspace member', async () => {
        await service.matchParticipantsAfterWorkspaceMemberCreation({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          workspaceMemberId: 'workspace-member-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            id: expect.any(Object),
          },
          {
            workspaceMember: {
              id: 'workspace-member-id',
            },
          },
        );
      });
    });

    it('should throw error when workspace ID is not found', async () => {
      scopedWorkspaceContextFactory.create = jest.fn().mockReturnValue({
        workspaceId: null,
      });

      await expect(
        service.matchParticipantsAfterPersonCreation({
          handle: 'test-1@example.com',
          isPrimaryEmail: true,
          objectMetadataName: 'messageParticipant',
          personId: 'person-id',
        }),
      ).rejects.toThrow('Workspace ID is required');
    });
  });

  describe('unmatchParticipants', () => {
    beforeEach(() => {
      mockMessageParticipantRepository.update.mockResolvedValue({
        affected: 1,
      });
      mockMessageParticipantRepository.find.mockResolvedValue([]);
      mockPersonRepository.formatResult.mockResolvedValue([]);
    });

    describe('person unmatching', () => {
      it('should unmatch participants from person', async () => {
        await service.unmatchParticipants({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          personId: 'person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            handle: expect.any(Object),
          },
          {
            person: null,
          },
        );
      });

      it('should re-match to next best person after unmatching', async () => {
        const mockAlternativePeople = [
          {
            id: 'alternative-person',
            emails: {
              primaryEmail: 'test-1@example.com',
              additionalEmails: [],
            },
          },
        ] as PersonWorkspaceEntity[];

        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(mockAlternativePeople),
          withDeleted: jest.fn().mockReturnThis(),
        };

        mockPersonRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder,
        );
        mockPersonRepository.formatResult.mockResolvedValue(
          mockAlternativePeople,
        );

        const rematchedParticipants = [
          {
            id: 'participant-1',
            handle: 'test-1@example.com',
          },
        ] as MessageParticipantWorkspaceEntity[];

        mockMessageParticipantRepository.find.mockResolvedValue(
          rematchedParticipants,
        );

        await service.unmatchParticipants({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          personId: 'old-person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            handle: expect.any(Object),
          },
          {
            person: null,
          },
        );

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            handle: expect.any(Object),
          },
          {
            personId: 'alternative-person',
          },
        );

        expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
          'messageParticipant_matched',
          [
            {
              workspaceMemberId: null,
              participants: rematchedParticipants,
            },
          ],
          mockWorkspaceId,
        );
      });

      it('should not re-match when no alternative people found', async () => {
        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
          withDeleted: jest.fn().mockReturnThis(),
        };

        mockPersonRepository.createQueryBuilder.mockReturnValue(
          mockQueryBuilder,
        );
        mockPersonRepository.formatResult.mockResolvedValue([]);

        await service.unmatchParticipants({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          personId: 'person-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledTimes(
          1,
        );
        expect(
          workspaceEventEmitter.emitCustomBatchEvent,
        ).not.toHaveBeenCalled();
      });
    });

    describe('workspace member unmatching', () => {
      it('should unmatch participants from workspace member', async () => {
        await service.unmatchParticipants({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          workspaceMemberId: 'workspace-member-id',
        });

        expect(mockMessageParticipantRepository.update).toHaveBeenCalledWith(
          {
            handle: expect.any(Object),
          },
          {
            workspaceMember: null,
          },
        );
      });
    });

    it('should throw error when workspace ID is not found', async () => {
      scopedWorkspaceContextFactory.create = jest.fn().mockReturnValue({
        workspaceId: null,
      });

      await expect(
        service.unmatchParticipants({
          handle: 'test-1@example.com',
          objectMetadataName: 'messageParticipant',
          personId: 'person-id',
        }),
      ).rejects.toThrow('Workspace ID is required');
    });
  });

  describe('getParticipantRepository', () => {
    it('should return message participant repository for messageParticipant', async () => {
      const repository = await (service as any).getParticipantRepository(
        mockWorkspaceId,
        'messageParticipant',
      );

      expect(
        twentyORMGlobalManager.getRepositoryForWorkspace,
      ).toHaveBeenCalledWith(mockWorkspaceId, 'messageParticipant');
      expect(repository).toBe(mockMessageParticipantRepository);
    });

    it('should return calendar event participant repository for calendarEventParticipant', async () => {
      const repository = await (service as any).getParticipantRepository(
        mockWorkspaceId,
        'calendarEventParticipant',
      );

      expect(
        twentyORMGlobalManager.getRepositoryForWorkspace,
      ).toHaveBeenCalledWith(mockWorkspaceId, 'calendarEventParticipant');
      expect(repository).toBe(mockCalendarEventParticipantRepository);
    });
  });
});
