import { SentMessageRecordLinkService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-record-link.service';

const buildService = ({
  canUpdateRecord = true,
  existingMessageThreadTarget = null,
}: {
  canUpdateRecord?: boolean;
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
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => Promise<void>) =>
      callback(),
    ),
    getRepository: jest.fn(() => messageThreadTargetRepository),
  };
  const recordPermissionsService = {
    getPermissionsForRecords: jest
      .fn()
      .mockResolvedValue(
        new Map([['opportunity-id', { canUpdate: canUpdateRecord }]]),
      ),
  };

  const service = new SentMessageRecordLinkService(
    workspaceOrmManager as never,
    recordPermissionsService as never,
  );

  return { service, messageThreadTargetRepository, recordPermissionsService };
};

const LINK_ARGS = {
  authContext: { workspace: { id: 'workspace-id' } } as never,
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

  it('checks the sender access to the record itself, row-level rules included', async () => {
    const { service, recordPermissionsService } = buildService({});

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(
      recordPermissionsService.getPermissionsForRecords,
    ).toHaveBeenCalledWith({
      authContext: LINK_ARGS.authContext,
      flatObjectMetadata: { nameSingular: 'opportunity' },
      recordIds: ['opportunity-id'],
    });
  });

  it('does not link a record the sender cannot update or does not see', async () => {
    const { service, messageThreadTargetRepository } = buildService({
      canUpdateRecord: false,
    });

    await service.linkSentMessageThreadToRecord(LINK_ARGS);

    expect(messageThreadTargetRepository.insert).not.toHaveBeenCalled();
    expect(messageThreadTargetRepository.update).not.toHaveBeenCalled();
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
