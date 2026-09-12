import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import {
  buildMergeWorkflowRunStepInfosStatement,
  type WorkflowRunStepInfoPatchByStepId,
} from 'src/modules/workflow/workflow-runner/workflow-run/utils/build-merge-workflow-run-step-infos-statement.util';

const SCHEMA_NAME = 'workspace_1wgvd1injqtyx6j527d';
const WORKFLOW_RUN_ID = '07c0e3b0-1f3b-4a0a-9b8e-1d9d2c3f4a5b';
const STEP_ID = 'step-1';

const buildStatement = (
  stepInfoPatchByStepId: WorkflowRunStepInfoPatchByStepId,
) =>
  buildMergeWorkflowRunStepInfosStatement({
    schemaName: SCHEMA_NAME,
    workflowRunId: WORKFLOW_RUN_ID,
    stepInfoPatchByStepId,
  });

// Mirrors what the statement asks Postgres to do to one step info:
// (previous - keysToDelete) || patch
const applyMerge = (
  previousStepInfo: Record<string, unknown>,
  parameters: Record<string, unknown>,
  stepIndex: number,
): Record<string, unknown> => {
  const keysToDelete = (parameters[`stepInfoKeysToDelete_${stepIndex}`] ??
    []) as string[];

  const stepInfoWithoutDeletedKeys = Object.fromEntries(
    Object.entries(previousStepInfo).filter(
      ([key]) => !keysToDelete.includes(key),
    ),
  );

  return {
    ...stepInfoWithoutDeletedKeys,
    ...JSON.parse(parameters[`stepInfo_${stepIndex}`] as string),
  };
};

// What the read-modify-write it replaces persisted: a JS spread, then the
// JSON.stringify the ORM applied on its way to the jsonb column
const applyLegacySpread = (
  previousStepInfo: Record<string, unknown>,
  stepInfoPatch: Partial<WorkflowRunStepInfo>,
): Record<string, unknown> =>
  JSON.parse(JSON.stringify({ ...previousStepInfo, ...stepInfoPatch }));

describe('buildMergeWorkflowRunStepInfosStatement', () => {
  it('should scope the statement to the given workspace schema', () => {
    const { sql } = buildStatement({
      [STEP_ID]: { status: StepStatus.SUCCESS },
    });

    expect(sql).toContain(`"${SCHEMA_NAME}"."workflowRun"`);
  });

  it('should lock the row it merges into and return its pre-image', () => {
    const { sql } = buildStatement({
      [STEP_ID]: { status: StepStatus.SUCCESS },
    });

    expect(sql).toContain('FOR UPDATE');
    expect(sql).toContain('"state" AS "previousState"');
    expect(sql).toContain('"updatedAt" AS "previousUpdatedAt"');
    expect(sql).toContain('"updatedAt" = CURRENT_TIMESTAMP');
  });

  it('should bind the run id, the step id and the step info instead of inlining them', () => {
    const { sql, parameters } = buildStatement({
      [STEP_ID]: { status: StepStatus.SUCCESS, result: { name: 'Bob' } },
    });

    expect(sql).not.toContain(STEP_ID);
    expect(sql).not.toContain(WORKFLOW_RUN_ID);
    expect(sql).not.toContain('Bob');
    expect(parameters).toEqual({
      workflowRunId: WORKFLOW_RUN_ID,
      stepId_0: STEP_ID,
      stepInfo_0: JSON.stringify({
        status: StepStatus.SUCCESS,
        result: { name: 'Bob' },
      }),
    });
  });

  it('should not bind a delete list when the patch declares no undefined key', () => {
    const { sql, parameters } = buildStatement({
      [STEP_ID]: { status: StepStatus.SUCCESS },
    });

    expect(parameters).not.toHaveProperty('stepInfoKeysToDelete_0');
    expect(sql).not.toContain('::text[] -');
  });

  it('should delete the keys the patch declares as undefined before merging', () => {
    const { parameters } = buildStatement({
      [STEP_ID]: {
        status: StepStatus.NOT_STARTED,
        result: undefined,
        error: undefined,
        history: [{ status: StepStatus.FAILED, error: 'boom' }],
      },
    });

    expect(parameters.stepInfoKeysToDelete_0).toEqual(['result', 'error']);
    expect(parameters.stepInfo_0).toBe(
      JSON.stringify({
        status: StepStatus.NOT_STARTED,
        history: [{ status: StepStatus.FAILED, error: 'boom' }],
      }),
    );
  });

  it('should merge one step info per step id, reusing that step id for the path and the read', () => {
    const { sql, parameters } = buildStatement({
      'step-1': { status: StepStatus.SKIPPED },
      'step-2': { status: StepStatus.FAILED_SAFELY },
    });

    expect(sql.match(/jsonb_set\(/g)).toHaveLength(3);
    expect(sql).toContain(`ARRAY['stepInfos', :stepId_0]::text[]`);
    expect(sql).toContain(`ARRAY[:stepId_0]::text[]`);
    expect(sql).toContain(`ARRAY['stepInfos', :stepId_1]::text[]`);
    expect(sql).toContain(`ARRAY[:stepId_1]::text[]`);
    expect(parameters.stepId_0).toBe('step-1');
    expect(parameters.stepId_1).toBe('step-2');
  });

  it('should compile to a positional statement whose every value is bound', () => {
    const { sql, parameters } = buildStatement({
      'step-1': { status: StepStatus.SKIPPED, result: undefined },
      'step-2': { status: StepStatus.FAILED_SAFELY },
    });

    const compiledStatement = compileNamedParameters(sql, parameters);

    expect(compiledStatement.values).toEqual([
      WORKFLOW_RUN_ID,
      'step-1',
      ['result'],
      JSON.stringify({ status: StepStatus.SKIPPED }),
      'step-2',
      JSON.stringify({ status: StepStatus.FAILED_SAFELY }),
    ]);
    for (const parameterName of Object.keys(parameters)) {
      expect(compiledStatement.text).not.toContain(`:${parameterName}`);
    }
  });

  it('should leave the rest of the state column out of the write', () => {
    const { sql } = buildStatement({
      [STEP_ID]: { status: StepStatus.SUCCESS },
    });

    expect(sql).toContain(`ARRAY['stepInfos']::text[]`);
    expect(sql).not.toContain(`'flow'`);
  });

  describe('merge semantics', () => {
    const previousStepInfo = {
      status: StepStatus.FAILED,
      result: { previous: true },
      error: 'previous error',
      retryAttempt: 2,
      history: [{ status: StepStatus.FAILED, error: 'first failure' }],
    };

    it.each<[string, Partial<WorkflowRunStepInfo>]>([
      [
        'a success that replaces the result and drops the error',
        {
          result: { next: true },
          error: undefined,
          status: StepStatus.SUCCESS,
        },
      ],
      [
        'a failure that replaces the error and drops the result',
        { result: undefined, error: 'next error', status: StepStatus.FAILED },
      ],
      [
        'a pending event that drops both the result and the error',
        { result: undefined, error: undefined, status: StepStatus.PENDING },
      ],
      [
        'a status-only patch that keeps everything else',
        { status: StepStatus.RUNNING },
      ],
      [
        'a retry reset that appends to the history',
        {
          status: StepStatus.NOT_STARTED,
          result: undefined,
          error: undefined,
          history: [
            { status: StepStatus.FAILED, error: 'first failure' },
            { status: StepStatus.FAILED, error: 'previous error' },
          ],
        },
      ],
    ])(
      'should persist the same step info as the JS spread did for %s',
      (_description, stepInfoPatch) => {
        const { parameters } = buildStatement({ [STEP_ID]: stepInfoPatch });

        expect(applyMerge(previousStepInfo, parameters, 0)).toEqual(
          applyLegacySpread(previousStepInfo, stepInfoPatch),
        );
      },
    );

    it('should build a step info from scratch when the step has none yet', () => {
      const stepInfoPatch = {
        result: undefined,
        error: undefined,
        status: StepStatus.RUNNING,
      };

      const { parameters } = buildStatement({ [STEP_ID]: stepInfoPatch });

      expect(applyMerge({}, parameters, 0)).toEqual({
        status: StepStatus.RUNNING,
      });
    });
  });
});
