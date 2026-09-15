import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportEntity } from 'src/engine/core-modules/record-export/record-export.entity';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

it('only sends export progress to the requester, without filters or storage paths', async () => {
  const streams = {
    getActiveStreamIds: jest
      .fn()
      .mockResolvedValue(['requester', 'other-user', 'application']),
    getStreamsData: jest.fn().mockResolvedValue(
      new Map([
        ['requester', { authContext: { userWorkspaceId: 'owner' } }],
        ['other-user', { authContext: { userWorkspaceId: 'someone-else' } }],
        [
          'application',
          {
            authContext: {
              userWorkspaceId: 'owner',
              applicationId: 'application',
            },
          },
        ],
      ]),
    ),
    removeFromActiveStreams: jest.fn(),
  };
  const subscriptions = { publishToEventStream: jest.fn() };
  const broadcaster = new WorkspaceEventBroadcaster(
    streams as unknown as EventStreamService,
    subscriptions as unknown as SubscriptionService,
  );
  const recordExport = Object.assign(new RecordExportEntity(), {
    id: 'export',
    workspaceId: 'workspace',
    workspaceMemberId: 'member',
    filename: 'person.csv',
    status: RecordExportStatus.PROCESSING,
    processedRecordCount: 1000,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
    parameters: { filter: { private: 'value' } },
    filePath: 'private/path.csv',
  });
  await broadcaster.broadcastRecordExportEvent({
    workspaceId: 'workspace',
    userWorkspaceId: 'owner',
    recordExport,
  });
  expect(subscriptions.publishToEventStream).toHaveBeenCalledTimes(1);
  expect(subscriptions.publishToEventStream).toHaveBeenCalledWith(
    expect.objectContaining({
      workspaceId: 'workspace',
      eventStreamChannelId: 'requester',
    }),
  );
  const publishedExport =
    subscriptions.publishToEventStream.mock.calls[0][0].payload
      .recordExportEvents[0];
  expect(publishedExport.processedRecordCount).toBe(1000);
  expect(publishedExport).not.toHaveProperty('parameters');
  expect(publishedExport).not.toHaveProperty('filePath');
});
