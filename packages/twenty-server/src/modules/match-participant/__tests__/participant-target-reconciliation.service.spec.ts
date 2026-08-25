import { type GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';

const createMutationRepository = () => ({
  find: jest.fn(),
  insert: jest.fn(),
  updateMany: jest.fn(),
  delete: jest.fn(),
});

describe('ParticipantTargetReconciliationService', () => {
  it('projects calendar participants to person, company, and opportunity targets', async () => {
    const participantRepository = createMutationRepository();
    const personRepository = createMutationRepository();
    const opportunityRepository = createMutationRepository();
    const targetRepository = createMutationRepository();

    participantRepository.find.mockResolvedValue([
      { calendarEventId: 'event-1', personId: 'person-1' },
    ]);
    personRepository.find.mockResolvedValue([
      { id: 'person-1', companyId: 'company-1' },
    ]);
    opportunityRepository.find.mockResolvedValue([
      { id: 'opportunity-1', pointOfContactId: 'person-1' },
    ]);
    targetRepository.find.mockResolvedValue([]);

    const globalWorkspaceOrmManager = {
      getRepository: jest.fn((objectName: string) => {
        const repositories = {
          calendarEventParticipant: participantRepository,
          person: personRepository,
          opportunity: opportunityRepository,
          calendarEventTarget: targetRepository,
        };

        return repositories[objectName as keyof typeof repositories];
      }),
    } as unknown as GlobalWorkspaceOrmManager;
    const service = new ParticipantTargetReconciliationService(
      globalWorkspaceOrmManager,
    );

    await service.reconcileCalendarEventTargets({
      calendarEventIds: ['event-1'],
    });

    expect(targetRepository.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          calendarEventId: 'event-1',
          targetPersonId: 'person-1',
          isAutomaticallyAssigned: true,
          isManuallyAssigned: false,
        }),
        expect.objectContaining({
          calendarEventId: 'event-1',
          targetCompanyId: 'company-1',
        }),
        expect.objectContaining({
          calendarEventId: 'event-1',
          targetOpportunityId: 'opportunity-1',
        }),
      ]),
    );
  });

  it('reconciles a whole message thread when one message changes', async () => {
    const messageRepository = createMutationRepository();
    const participantRepository = createMutationRepository();
    const personRepository = createMutationRepository();
    const opportunityRepository = createMutationRepository();
    const targetRepository = createMutationRepository();

    messageRepository.find
      .mockResolvedValueOnce([
        { id: 'changed-message', messageThreadId: 'thread-1' },
      ])
      .mockResolvedValueOnce([
        { id: 'changed-message', messageThreadId: 'thread-1' },
        { id: 'older-message', messageThreadId: 'thread-1' },
      ]);
    participantRepository.find.mockResolvedValue([
      { messageId: 'older-message', personId: 'person-from-older-message' },
    ]);
    personRepository.find.mockResolvedValue([
      { id: 'person-from-older-message', companyId: null },
    ]);
    opportunityRepository.find.mockResolvedValue([]);
    targetRepository.find.mockResolvedValue([]);

    const globalWorkspaceOrmManager = {
      getRepository: jest.fn((objectName: string) => {
        const repositories = {
          message: messageRepository,
          messageParticipant: participantRepository,
          person: personRepository,
          opportunity: opportunityRepository,
          messageThreadTarget: targetRepository,
        };

        return repositories[objectName as keyof typeof repositories];
      }),
    } as unknown as GlobalWorkspaceOrmManager;
    const service = new ParticipantTargetReconciliationService(
      globalWorkspaceOrmManager,
    );

    await service.reconcileMessageThreadTargetsFromMessageIds({
      messageIds: ['changed-message'],
    });

    expect(targetRepository.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        messageThreadId: 'thread-1',
        targetPersonId: 'person-from-older-message',
      }),
    ]);
  });
});
