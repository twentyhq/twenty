// The real service pulls the logic-function driver chain, whose browser-targeted
// client SDK bundle cannot load under jest; this suite never calls it
jest.mock(
  'src/modules/workflow/common/workspace-services/workflow-common.workspace-service',
  () => ({ WorkflowCommonWorkspaceService: class {} }),
);

import { FieldMetadataType } from 'twenty-shared/types';
import { StepStatus } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunExceptionCode } from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = '8c8b4e5a-1d0a-4f4d-9f1e-1a2b3c4d5e6f';
const WORKFLOW_RUN_ID = '07c0e3b0-1f3b-4a0a-9b8e-1d9d2c3f4a5b';

const STATE_FIELD = getFlatFieldMetadataMock({
  id: 'state-field',
  universalIdentifier: 'state-field-uid',
  objectMetadataId: 'workflow-run-object',
  name: 'state',
  type: FieldMetadataType.RAW_JSON,
});

const UPDATED_AT_FIELD = getFlatFieldMetadataMock({
  id: 'updated-at-field',
  universalIdentifier: 'updated-at-field-uid',
  objectMetadataId: 'workflow-run-object',
  name: 'updatedAt',
  type: FieldMetadataType.DATE_TIME,
});

const WORKFLOW_RUN_OBJECT = getFlatObjectMetadataMock({
  id: 'workflow-run-object',
  universalIdentifier: 'workflow-run-object-uid',
  nameSingular: 'workflowRun',
  namePlural: 'workflowRuns',
  fieldIds: [STATE_FIELD.id, UPDATED_AT_FIELD.id],
});

const buildFlatEntityMaps = <
  TEntity extends { id: string; universalIdentifier: string },
>(
  flatEntities: TEntity[],
): FlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const buildHarness = ({
  mutatedRows,
}: {
  mutatedRows?: Record<string, unknown>[];
} = {}) => {
  const executeRaw = jest.fn(
    async (_sql: string, _parameters: Record<string, unknown>) =>
      mutatedRows ?? [
        {
          id: WORKFLOW_RUN_ID,
          state: {
            flow: { steps: [] },
            stepInfos: { 'step-1': { status: StepStatus.SUCCESS } },
          },
          updatedAt: '2026-01-02T00:00:00.000Z',
          previousState: {
            flow: { steps: [] },
            stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
          },
          previousUpdatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
  );
  const emitDatabaseBatchEvent = jest.fn();
  const update = jest.fn();

  const workflowRunRepository = {
    executeRaw,
    update,
    formatResult: (records: unknown) => records,
    internalContext: {
      workspaceId: WORKSPACE_ID,
      objectIdByNameSingular: { workflowRun: WORKFLOW_RUN_OBJECT.id },
      flatObjectMetadataMaps: buildFlatEntityMaps([WORKFLOW_RUN_OBJECT]),
      flatFieldMetadataMaps: buildFlatEntityMaps([
        STATE_FIELD,
        UPDATED_AT_FIELD,
      ]),
      eventEmitterService: { emitDatabaseBatchEvent },
    },
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: async (fn: () => unknown) => fn(),
    getRepository: () => workflowRunRepository,
  } as unknown as WorkspaceOrmManager;

  const service = new WorkflowRunWorkspaceService(
    workspaceOrmManager,
    {} as WorkflowCommonWorkspaceService,
    {} as RecordPositionService,
    {} as MetricsService,
  );

  const getStatementParameters = () =>
    executeRaw.mock.calls[0][1] as Record<string, unknown>;

  return {
    service,
    executeRaw,
    update,
    emitDatabaseBatchEvent,
    getStatementParameters,
  };
};

describe('WorkflowRunWorkspaceService', () => {
  describe('updateWorkflowRunStepInfo', () => {
    it('should write the step info without reading the run first', async () => {
      const { service, executeRaw, update } = buildHarness();

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-1',
        stepInfo: { status: StepStatus.SUCCESS, result: { name: 'Bob' } },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(executeRaw).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
    });

    it('should replace the result, the error and the status and leave the rest of the step info alone', async () => {
      const { service, getStatementParameters } = buildHarness();

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-1',
        stepInfo: {
          status: StepStatus.SUCCESS,
          result: { name: 'Bob' },
          history: [{ status: StepStatus.FAILED, error: 'boom' }],
        },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      const parameters = getStatementParameters();

      expect(parameters.stepId_0).toBe('step-1');
      expect(JSON.parse(parameters.stepInfo_0 as string)).toEqual({
        status: StepStatus.SUCCESS,
        result: { name: 'Bob' },
      });
      expect(parameters.stepInfoKeysToDelete_0).toEqual(['error']);
    });

    it('should drop the result and the error the caller left out', async () => {
      const { service, getStatementParameters } = buildHarness();

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-1',
        stepInfo: { status: StepStatus.PENDING },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      const parameters = getStatementParameters();

      expect(JSON.parse(parameters.stepInfo_0 as string)).toEqual({
        status: StepStatus.PENDING,
      });
      expect(parameters.stepInfoKeysToDelete_0).toEqual(['result', 'error']);
    });

    it('should publish the workflowRun.updated event the front-end listens to', async () => {
      const { service, emitDatabaseBatchEvent } = buildHarness();

      await service.updateWorkflowRunStepInfo({
        stepId: 'step-1',
        stepInfo: { status: StepStatus.RUNNING },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(emitDatabaseBatchEvent).toHaveBeenCalledTimes(1);

      const [batchEvent] = emitDatabaseBatchEvent.mock.calls[0];

      expect(batchEvent).toMatchObject({
        objectMetadataNameSingular: 'workflowRun',
        action: 'updated',
        workspaceId: WORKSPACE_ID,
      });
      expect(batchEvent.events[0]).toMatchObject({
        recordId: WORKFLOW_RUN_ID,
        properties: {
          updatedFields: ['state'],
          after: {
            state: {
              flow: { steps: [] },
              stepInfos: { 'step-1': { status: StepStatus.SUCCESS } },
            },
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
          before: {
            state: {
              flow: { steps: [] },
              stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
            },
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      });
    });

    it('should fail when the run does not exist', async () => {
      const { service } = buildHarness({ mutatedRows: [] });

      await expect(
        service.updateWorkflowRunStepInfo({
          stepId: 'step-1',
          stepInfo: { status: StepStatus.RUNNING },
          workflowRunId: WORKFLOW_RUN_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      });
    });
  });

  describe('updateWorkflowRunStepInfos', () => {
    it('should merge every given step id in a single statement', async () => {
      const { service, executeRaw, getStatementParameters } = buildHarness();

      await service.updateWorkflowRunStepInfos({
        stepInfos: {
          'step-1': { status: StepStatus.SKIPPED },
          'step-2': { status: StepStatus.FAILED_SAFELY },
        },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      const parameters = getStatementParameters();

      expect(executeRaw).toHaveBeenCalledTimes(1);
      expect(parameters.stepId_0).toBe('step-1');
      expect(parameters.stepId_1).toBe('step-2');
      expect(JSON.parse(parameters.stepInfo_0 as string)).toEqual({
        status: StepStatus.SKIPPED,
      });
      expect(JSON.parse(parameters.stepInfo_1 as string)).toEqual({
        status: StepStatus.FAILED_SAFELY,
      });
    });

    it('should merge the given keys into the existing step info rather than replace it', async () => {
      const { service, getStatementParameters } = buildHarness();

      await service.updateWorkflowRunStepInfos({
        stepInfos: {
          'step-1': {
            status: StepStatus.PENDING,
            error: 'boom',
            history: [
              { status: StepStatus.FAILED, error: 'boom', retryAttempt: 1 },
            ],
          },
        },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      const parameters = getStatementParameters();

      expect(JSON.parse(parameters.stepInfo_0 as string)).toEqual({
        status: StepStatus.PENDING,
        error: 'boom',
        history: [
          { status: StepStatus.FAILED, error: 'boom', retryAttempt: 1 },
        ],
      });
      expect(parameters).not.toHaveProperty('stepInfoKeysToDelete_0');
    });

    it('should drop the keys a step info reset declares as undefined', async () => {
      const { service, getStatementParameters } = buildHarness();

      await service.updateWorkflowRunStepInfos({
        stepInfos: {
          'step-1': {
            status: StepStatus.NOT_STARTED,
            result: undefined,
            error: undefined,
            history: [{ status: StepStatus.SUCCESS }],
          },
        },
        workflowRunId: WORKFLOW_RUN_ID,
        workspaceId: WORKSPACE_ID,
      });

      const parameters = getStatementParameters();

      expect(parameters.stepInfoKeysToDelete_0).toEqual(['result', 'error']);
      expect(JSON.parse(parameters.stepInfo_0 as string)).toEqual({
        status: StepStatus.NOT_STARTED,
        history: [{ status: StepStatus.SUCCESS }],
      });
    });
  });
});
