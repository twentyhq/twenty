import { FindOperator } from 'typeorm';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getStuckStoppingRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-stopping-runs-find-options.util';

describe('getStuckStoppingRunsFindOptions', () => {
  it('should match STOPPING runs older than the threshold', () => {
    const where = getStuckStoppingRunsFindOptions();

    expect(where.status).toBe(WorkflowRunStatus.STOPPING);
    expect(where.updatedAt).toBeInstanceOf(FindOperator);
  });
});
