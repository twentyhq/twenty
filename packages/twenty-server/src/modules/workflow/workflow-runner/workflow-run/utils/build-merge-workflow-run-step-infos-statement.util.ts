import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type WorkflowRunStepInfoPatchByStepId = Record<
  string,
  Partial<WorkflowRunStepInfo>
>;

export type MergeWorkflowRunStepInfosStatement = {
  sql: string;
  parameters: Record<string, unknown>;
};

const WORKFLOW_RUN_TABLE_NAME = 'workflowRun';

// A patch key set to undefined vanished when the state column was
// JSON.stringify-ed on its way to jsonb, dropping the previous value. The jsonb
// `||` merge would keep it instead, so those keys are deleted before merging.
const buildStepInfoKeysToDelete = (
  stepInfoPatch: Partial<WorkflowRunStepInfo>,
): string[] =>
  Object.entries(stepInfoPatch)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key);

export const buildMergeWorkflowRunStepInfosStatement = ({
  schemaName,
  workflowRunId,
  stepInfoPatchByStepId,
}: {
  schemaName: string;
  workflowRunId: string;
  stepInfoPatchByStepId: WorkflowRunStepInfoPatchByStepId;
}): MergeWorkflowRunStepInfosStatement => {
  const parameters: Record<string, unknown> = { workflowRunId };

  let stepInfosExpression = `COALESCE("previousWorkflowRun"."previousState" -> 'stepInfos', '{}'::jsonb)`;

  Object.entries(stepInfoPatchByStepId).forEach(
    ([stepId, stepInfoPatch], stepIndex) => {
      const stepIdParameterName = `stepId_${stepIndex}`;
      const stepInfoParameterName = `stepInfo_${stepIndex}`;

      parameters[stepIdParameterName] = stepId;
      parameters[stepInfoParameterName] = JSON.stringify(stepInfoPatch);

      let previousStepInfoExpression = `COALESCE("previousWorkflowRun"."previousState" #> ARRAY['stepInfos', :${stepIdParameterName}]::text[], '{}'::jsonb)`;

      const stepInfoKeysToDelete = buildStepInfoKeysToDelete(stepInfoPatch);

      if (stepInfoKeysToDelete.length > 0) {
        const keysToDeleteParameterName = `stepInfoKeysToDelete_${stepIndex}`;

        parameters[keysToDeleteParameterName] = stepInfoKeysToDelete;
        previousStepInfoExpression = `(${previousStepInfoExpression} - :${keysToDeleteParameterName}::text[])`;
      }

      stepInfosExpression = `jsonb_set(${stepInfosExpression}, ARRAY[:${stepIdParameterName}]::text[], ${previousStepInfoExpression} || :${stepInfoParameterName}::jsonb, true)`;
    },
  );

  const qualifiedTableName = `${escapeIdentifier(schemaName)}.${escapeIdentifier(
    WORKFLOW_RUN_TABLE_NAME,
  )}`;

  // FOR UPDATE makes the read-merge-write atomic inside Postgres: a sibling
  // branch writing another step id waits for the row lock instead of racing on
  // a snapshot, which is what the run-wide mutex used to buy. The pre-image is
  // returned alongside the new row so the workflowRun.updated event this
  // service emits itself carries the same before/after the ORM would have.
  const sql = `WITH "previousWorkflowRun" AS (
  SELECT
    "id",
    "state" AS "previousState",
    "updatedAt" AS "previousUpdatedAt"
  FROM ${qualifiedTableName}
  WHERE "id" = :workflowRunId
  FOR UPDATE
)
UPDATE ${qualifiedTableName} AS "workflowRunToUpdate"
SET
  "state" = jsonb_set(
    COALESCE("previousWorkflowRun"."previousState", '{}'::jsonb),
    ARRAY['stepInfos']::text[],
    ${stepInfosExpression},
    true
  ),
  "updatedAt" = CURRENT_TIMESTAMP
FROM "previousWorkflowRun"
WHERE "workflowRunToUpdate"."id" = "previousWorkflowRun"."id"
RETURNING
  "workflowRunToUpdate".*,
  "previousWorkflowRun"."previousState",
  "previousWorkflowRun"."previousUpdatedAt"`;

  return { sql, parameters };
};
