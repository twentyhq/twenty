import { Logger } from '@nestjs/common';

import { ExecutiveSyncProcessOutboxJob } from 'src/modules/executive-search/sync/jobs/executive-sync-process-outbox.job';
import { OutboundProjectionService } from 'src/modules/executive-search/outbound/services/outbound-projection.service';

describe('ExecutiveSyncProcessOutboxJob', () => {
  let job: ExecutiveSyncProcessOutboxJob;
  let mockProjectionService: jest.Mocked<OutboundProjectionService>;

  const data = {
    workspaceId: 'workspace-1',
    outboxId: 'outbox-1',
  };

  beforeEach(() => {
    mockProjectionService = {
      deliver: jest.fn(),
    } as unknown as jest.Mocked<OutboundProjectionService>;

    job = new ExecutiveSyncProcessOutboxJob(mockProjectionService);
  });

  it('should call projectionService.deliver with correct args', async () => {
    await job.handle(data);

    expect(mockProjectionService.deliver).toHaveBeenCalledWith(
      data.workspaceId,
      data.outboxId,
    );
  });

  it('should log error when projectionService throws but NOT rethrow', async () => {
    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const projectionError = new Error('Directus connection refused');

    mockProjectionService.deliver.mockRejectedValue(projectionError);

    // Should not throw
    await expect(job.handle(data)).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unhandled error in outbox job'),
    );

    loggerErrorSpy.mockRestore();
  });
});
