import { SentMessageRecordLinkService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-record-link.service';

const OPPORTUNITY_OBJECT_METADATA_ID = 'opportunity-object-metadata-id';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({
    getWorkspaceContext: () => ({
      objectIdByNameSingular: { opportunity: OPPORTUNITY_OBJECT_METADATA_ID },
    }),
  }),
);

const buildService = ({
  canUpdateOpportunities = true,
  doesRecordExist = true,
  existingMessageThreadTarget = null,
}: {
  canUpdateOpportunities?: boolean;
  doesRecordExist?: boolean;
  existingMessageThreadTarget?: {
    id: string;
    isManuallyAssigned: boolean;
  } | null;
}) => {
  const messageThreadTargetRepository = {
    findOne: jest.fn().mockResolvedValue(existingMessageThreadTarget),
    insert: jest.fn(),
    update: jest.fn(),
  };
  const targetRecordRepository = {
    exists: jest.fn().mockResolvedValue(doesRecordExist),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
      callback(),
    ),
    getRepository: jest.fn((objectNameSingular: string) =>
      objectNameSingular === 'messageThreadTarget'
        ? messageThreadTargetRepository
        : targetRecordRepository,
    ),
  };
  const permissionsService = {
    getUserWorkspacePermissions: jest.fn().mockResolvedValue({
      objectsPermissions: {
        [OPPORTUNITY_OBJECT_METADATA_ID]: {
          canUpdateObjectRecords: canUpdateOpportunities,
        },
      },
    }),
  };

  const service = new SentMessageRecordLinkService(
    workspaceOrmManager as never,
    permissionsService as never,
  );

  return { service, messageThreadTargetRepository };
};

const LINK_ARGS = {
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
  messageThreadId: 'message-thread-id',
  objectNameSingular: 'opportunity',
  recordId: 'opportunity-id',
};

describe('SentMessageRecordLinkService', () => {
  it('creates a manual link between the sent thread and the record', async () => {
    const { service, messageThreadTargetRepository } = buildService({});

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(messageThreadTargetRepository.insert).toHaveBeenCalledWith({
      messageThreadId: 'message-thread-id',
      targetOpportunityId: 'opportunity-id',
      isAutomaticallyAssigned: false,
      isManuallyAssigned: true,
    });
  });

  it('marks an existing automatic link as manual instead of duplicating it', async () => {
    const { service, messageThreadTargetRepository } = buildService({
      existingMessageThreadTarget: {
        id: 'message-thread-target-id',
        isManuallyAssigned: false,
      },
    });

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(messageThreadTargetRepository.update).toHaveBeenCalledWith(
      'message-thread-target-id',
      { isManuallyAssigned: true },
    );
    expect(messageThreadTargetRepository.insert).not.toHaveBeenCalled();
  });

  it('does not link when the sender cannot update the record', async () => {
    const { service, messageThreadTargetRepository } = buildService({
      canUpdateOpportunities: false,
    });

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(messageThreadTargetRepository.insert).not.toHaveBeenCalled();
    expect(messageThreadTargetRepository.update).not.toHaveBeenCalled();
  });

  it('does not link to a record that does not exist', async () => {
    const { service, messageThreadTargetRepository } = buildService({
      doesRecordExist: false,
    });

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(messageThreadTargetRepository.insert).not.toHaveBeenCalled();
  });

  it('ignores objects that cannot be targeted by a thread', async () => {
    const { service, messageThreadTargetRepository } = buildService({});

    await service.linkSentMessageThreadToRecord({
      ...LINK_ARGS,
      objectNameSingular: 'pet',
    });

    expect(messageThreadTargetRepository.insert).not.toHaveBeenCalled();
  });
});
