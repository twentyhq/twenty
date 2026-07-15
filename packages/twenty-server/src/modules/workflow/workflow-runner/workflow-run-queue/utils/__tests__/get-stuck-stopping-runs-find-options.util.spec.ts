import { FindOperator } from 'typeorm';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getStuckStoppingRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-stopping-runs-find-options.util';

describe('getStuckStoppingRunsFindOptions', () => {
  it('should match STOPPING runs past the threshold when no cursor is given', () => {
    const where = getStuckStoppingRunsFindOptions();

    expect(Array.isArray(where)).toBe(false);
    expect(where).toMatchObject({ status: WorkflowRunStatus.STOPPING });
    expect(
      (where as { updatedAt: FindOperator<string> }).updatedAt,
    ).toBeInstanceOf(FindOperator);
  });

  it('should build a keyset OR condition when a cursor is given', () => {
    const cursor = { createdAt: '2024-01-01T00:00:00.000Z', id: 'run-1' };

    const where = getStuckStoppingRunsFindOptions(cursor);

    expect(Array.isArray(where)).toBe(true);

    const [afterCreatedAt, sameCreatedAtAfterId] = where as Array<
      Record<string, unknown>
    >;

    // Strictly newer createdAt
    expect(afterCreatedAt.status).toBe(WorkflowRunStatus.STOPPING);
    expect(afterCreatedAt.createdAt).toBeInstanceOf(FindOperator);
    expect(afterCreatedAt.id).toBeUndefined();

    // Same createdAt, tie-broken by a greater id
    expect(sameCreatedAtAfterId.createdAt).toBe(cursor.createdAt);
    expect(sameCreatedAtAfterId.id).toBeInstanceOf(FindOperator);
  });
});
