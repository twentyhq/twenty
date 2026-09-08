import { Test } from '@nestjs/testing';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { ArtificialAnalysisSyncCronJob } from 'src/engine/metadata-modules/ai/ai-models/crons/artificial-analysis-sync.cron.job';
import { ArtificialAnalysisSyncCronCommand } from 'src/engine/metadata-modules/ai/ai-models/crons/commands/artificial-analysis-sync.cron.command';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

describe('Artificial Analysis background refresh', () => {
  const catalogService = {
    isSyncEnabled: jest.fn(),
    refreshCatalog: jest.fn(),
  };
  const queue = {
    add: jest.fn(),
    addCron: jest.fn(),
    removeCron: jest.fn(),
  };
  let command: ArtificialAnalysisSyncCronCommand;
  let job: ArtificialAnalysisSyncCronJob;

  beforeEach(async () => {
    jest.clearAllMocks();
    catalogService.isSyncEnabled.mockReturnValue(true);
    const module = await Test.createTestingModule({
      providers: [
        ArtificialAnalysisSyncCronCommand,
        ArtificialAnalysisSyncCronJob,
        { provide: ArtificialAnalysisCatalogService, useValue: catalogService },
        { provide: getQueueToken(MessageQueue.cronQueue), useValue: queue },
      ],
    }).compile();

    command = module.get(ArtificialAnalysisSyncCronCommand);
    job = module.get(ArtificialAnalysisSyncCronJob);
  });

  it('schedules hourly due checks and queues the initial refresh for the worker', async () => {
    await command.run();

    expect(queue.addCron).toHaveBeenCalledWith({
      jobName: ArtificialAnalysisSyncCronJob.name,
      data: undefined,
      options: { repeat: { pattern: '0 * * * *' } },
    });
    expect(queue.add).toHaveBeenCalledWith(
      ArtificialAnalysisSyncCronJob.name,
      {},
    );
    expect(catalogService.refreshCatalog).not.toHaveBeenCalled();

    await job.handle();
    expect(catalogService.refreshCatalog).toHaveBeenCalledTimes(1);
  });

  it('removes an existing schedule when automatic refresh is disabled', async () => {
    catalogService.isSyncEnabled.mockReturnValue(false);
    await command.run();

    expect(queue.removeCron).toHaveBeenCalledWith({
      jobName: ArtificialAnalysisSyncCronJob.name,
    });
    expect(queue.add).not.toHaveBeenCalled();
    expect(queue.addCron).not.toHaveBeenCalled();
  });
});
