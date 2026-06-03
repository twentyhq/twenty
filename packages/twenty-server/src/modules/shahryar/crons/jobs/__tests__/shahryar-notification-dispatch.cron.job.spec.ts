import { type Repository } from 'typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ShahryarNotificationDispatchCronJob } from 'src/modules/shahryar/crons/jobs/shahryar-notification-dispatch.cron.job';
import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';

describe('ShahryarNotificationDispatchCronJob', () => {
  it('should dispatch pending notifications for active workspaces and capture workspace errors', async () => {
    const dispatchPendingNotifications = jest
      .fn<
        Promise<{
          attemptedCount: number;
          failedCount: number;
          failedDeliveryIds: string[];
          sentCount: number;
        }>,
        [
          Parameters<
            ShahryarNotificationService['dispatchPendingNotifications']
          >[0],
        ]
      >()
      .mockResolvedValueOnce({
        attemptedCount: 2,
        sentCount: 2,
        failedCount: 0,
        failedDeliveryIds: [],
      })
      .mockRejectedValueOnce(new Error('metadata missing'));
    const find = jest.fn().mockResolvedValue([
      {
        id: 'workspace-1',
      },
      {
        id: 'workspace-2',
      },
    ] as WorkspaceEntity[]);
    const captureExceptions = jest.fn();
    const job = new ShahryarNotificationDispatchCronJob(
      {
        find,
      } as unknown as Repository<WorkspaceEntity>,
      {
        dispatchPendingNotifications,
      } as unknown as ShahryarNotificationService,
      {
        captureExceptions,
      } as unknown as ExceptionHandlerService,
    );

    await job.handle();

    expect(find).toHaveBeenCalledWith({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });
    expect(dispatchPendingNotifications).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
    });
    expect(dispatchPendingNotifications).toHaveBeenCalledWith({
      workspaceId: 'workspace-2',
    });
    expect(captureExceptions).toHaveBeenCalledWith(
      [expect.any(Error)],
      expect.objectContaining({
        workspace: {
          id: 'workspace-2',
        },
      }),
    );
  });
});
