import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowAiAgentStepAgentService } from 'src/modules/workflow/workflow-builder/workflow-version-step/services/workflow-ai-agent-step-agent.service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { type WorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';
const LEGACY_LOGIC_FUNCTION_ID = '20202020-0000-4000-8000-000000000001';

const buildCodeStep = (input: WorkflowCodeActionInput): WorkflowCodeAction => ({
  id: 'code-step-id',
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  nextStepIds: [],
  settings: {
    input,
    outputSchema: {},
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
});

const buildService = async () => {
  const codeStepBuildService = {
    duplicateCodeStepLogicFunction: jest
      .fn()
      .mockResolvedValue({ id: 'duplicated-logic-function-id' }),
  };
  const logicFunctionFromSourceService = {
    deleteOneWithSource: jest.fn().mockResolvedValue(undefined),
  };

  const testingModule = await Test.createTestingModule({
    providers: [
      WorkflowVersionStepOperationsWorkspaceService,
      { provide: WorkspaceOrmManager, useValue: {} },
      {
        provide: LogicFunctionFromSourceService,
        useValue: logicFunctionFromSourceService,
      },
      { provide: CodeStepBuildService, useValue: codeStepBuildService },
      {
        provide: getWorkspaceScopedRepositoryToken(ObjectMetadataEntity),
        useValue: {},
      },
      { provide: WorkflowCommonWorkspaceService, useValue: {} },
      { provide: WorkspaceCacheService, useValue: {} },
      { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
      { provide: WorkflowVersionCoreSyncService, useValue: {} },
      { provide: FindRecordsService, useValue: {} },
      { provide: FeatureFlagService, useValue: {} },
      { provide: WorkflowAiAgentStepAgentService, useValue: {} },
    ],
  }).compile();

  return {
    service: testingModule.get(WorkflowVersionStepOperationsWorkspaceService),
    codeStepBuildService,
    logicFunctionFromSourceService,
  };
};

describe('WorkflowVersionStepOperationsWorkspaceService code steps', () => {
  it('creates a CODE step holding the seed source and no logic function', async () => {
    const { service, codeStepBuildService } = await buildService();

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.CODE,
      workspaceId: WORKSPACE_ID,
    });

    expect(builtStep.type).toBe(WorkflowActionType.CODE);
    expect(builtStep.settings.input).toEqual({
      code: expect.stringContaining('export const main'),
      logicFunctionInput: { a: null, b: null },
    });
    expect(
      codeStepBuildService.duplicateCodeStepLogicFunction,
    ).not.toHaveBeenCalled();
  });

  it('creates a CODE step with the given source and input', async () => {
    const { service } = await buildService();

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.CODE,
      workspaceId: WORKSPACE_ID,
      defaultSettings: {
        input: {
          code: 'export const main = async () => ({});',
          logicFunctionInput: { a: 1 },
        },
      },
    });

    expect(builtStep.settings.input).toEqual({
      code: 'export const main = async () => ({});',
      logicFunctionInput: { a: 1 },
    });
  });

  it('copies an inline CODE step as plain JSON', async () => {
    const { service, codeStepBuildService } = await buildService();
    const step = buildCodeStep({
      code: 'export const main = async () => ({});',
      logicFunctionInput: {},
    });

    const clonedStep = await service.cloneStep({
      step,
      workspaceId: WORKSPACE_ID,
    });
    const draftStep = await service.createDraftStep({
      step,
      workspaceId: WORKSPACE_ID,
    });

    expect(clonedStep.id).not.toBe(step.id);
    expect(clonedStep.settings).toEqual(step.settings);
    expect(draftStep).toEqual(step);
    expect(
      codeStepBuildService.duplicateCodeStepLogicFunction,
    ).not.toHaveBeenCalled();
  });

  it('still copies the logic function of a legacy CODE step', async () => {
    const { service } = await buildService();

    const draftStep = await service.createDraftStep({
      step: buildCodeStep({
        logicFunctionId: LEGACY_LOGIC_FUNCTION_ID,
        logicFunctionInput: {},
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(draftStep.settings.input).toEqual({
      logicFunctionId: 'duplicated-logic-function-id',
      logicFunctionInput: {},
    });
  });

  it('deletes the logic function of legacy CODE steps only', async () => {
    const { service, logicFunctionFromSourceService } = await buildService();

    await service.runWorkflowVersionStepDeletionSideEffects({
      step: buildCodeStep({
        code: 'export const main = async () => ({});',
        logicFunctionInput: {},
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(
      logicFunctionFromSourceService.deleteOneWithSource,
    ).not.toHaveBeenCalled();

    await service.runWorkflowVersionStepDeletionSideEffects({
      step: buildCodeStep({
        logicFunctionId: LEGACY_LOGIC_FUNCTION_ID,
        logicFunctionInput: {},
      }),
      workspaceId: WORKSPACE_ID,
    });

    expect(
      logicFunctionFromSourceService.deleteOneWithSource,
    ).toHaveBeenCalledWith({
      id: LEGACY_LOGIC_FUNCTION_ID,
      workspaceId: WORKSPACE_ID,
    });
  });
});
