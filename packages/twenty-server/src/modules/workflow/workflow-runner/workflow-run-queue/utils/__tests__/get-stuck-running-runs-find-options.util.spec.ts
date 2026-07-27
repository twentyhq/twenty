import { FindOperator } from 'typeorm';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getStuckRunningRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-find-options.util';

describe('getStuckRunningRunsFindOptions', () => {
  it('should match RUNNING runs older than the threshold', () => {
    const where = getStuckRunningRunsFindOptions();

    expect(where.status).toBe(WorkflowRunStatus.RUNNING);
    expect(where.updatedAt).toBeInstanceOf(FindOperator);
    expect((where.updatedAt as FindOperator<string>).type).toBe('lessThan');
  });
});
