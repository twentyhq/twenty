import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ApplicationMessageReadStateService } from 'src/engine/metadata-modules/message-channel/services/application-message-read-state.service';

describe('ApplicationMessageReadStateService before the isRead upgrade', () => {
  it('updates nothing while the workspace lacks the isRead field', async () => {
    const applicationMessageChannelsService = {
      findOwnedOrThrow: jest.fn().mockResolvedValue({}),
    };
    const workspaceOrmManager = { executeInWorkspaceContext: jest.fn() };
    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    };

    const service = new ApplicationMessageReadStateService(
      applicationMessageChannelsService as never,
      workspaceOrmManager as never,
      workspaceCacheService as never,
    );

    await expect(
      service.setThreadReadState({
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
        requestUserWorkspaceId: null,
        messageChannelId: 'channel-id',
        threadExternalId: 'thread-external-id',
        isRead: false,
      }),
    ).resolves.toEqual({ updatedMessageCount: 0 });

    expect(
      applicationMessageChannelsService.findOwnedOrThrow,
    ).toHaveBeenCalled();
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });
});

describe('ApplicationMessageReadStateService batching', () => {
  it('marks a long thread read in batches the repository accepts', async () => {
    const associations = Array.from({ length: 450 }, (_, index) => ({
      id: `association-${index}`,
      isRead: false,
      direction: 'INCOMING',
      message: { receivedAt: new Date('2026-10-20T10:00:00.000Z') },
    }));
    const repository = {
      find: jest.fn().mockResolvedValue(associations),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback: () => unknown) =>
        callback(),
      ),
      getRepositoryWithoutPermissionChecks: jest.fn(() => repository),
    };

    const service = new ApplicationMessageReadStateService(
      { findOwnedOrThrow: jest.fn().mockResolvedValue({}) } as never,
      workspaceOrmManager as never,
      {
        getOrRecompute: jest.fn().mockResolvedValue({
          flatFieldMetadataMaps: {
            byUniversalIdentifier: {
              [STANDARD_OBJECTS.messageChannelMessageAssociation.fields.isRead
                .universalIdentifier]: {},
            },
          },
        }),
      } as never,
    );

    await expect(
      service.setThreadReadState({
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
        requestUserWorkspaceId: null,
        messageChannelId: 'channel-id',
        threadExternalId: 'thread-external-id',
        isRead: true,
      }),
    ).resolves.toEqual({ updatedMessageCount: 450 });

    expect(
      repository.update.mock.calls.map(
        ([criteria]) => criteria.id.value.length,
      ),
    ).toEqual([QUERY_MAX_RECORDS, QUERY_MAX_RECORDS, 50]);
  });
});
