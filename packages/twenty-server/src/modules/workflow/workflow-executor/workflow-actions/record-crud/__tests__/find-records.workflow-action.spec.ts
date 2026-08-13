import { Test, type TestingModule } from '@nestjs/testing';

import { ViewFilterOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { FindRecordsWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/find-records.workflow-action';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';

const baseSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: false },
    continueOnFailure: { value: false },
  },
};

const buildFindRecordsStep = (input: Record<string, unknown>): WorkflowAction =>
  ({
    id: 'step-1',
    type: WorkflowActionType.FIND_RECORDS,
    name: 'Find Records',
    valid: true,
    settings: { ...baseSettings, input },
  }) as WorkflowAction;

describe('FindRecordsWorkflowAction', () => {
  let action: FindRecordsWorkflowAction;
  let mockFindRecordsService: jest.Mocked<Pick<FindRecordsService, 'execute'>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockFindRecordsService = {
      execute: jest.fn().mockResolvedValue({
        success: true,
        message: 'Found 0 records',
        result: { records: [], count: 0, hasNextPage: false },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindRecordsWorkflowAction,
        { provide: FindRecordsService, useValue: mockFindRecordsService },
        {
          provide: WorkflowExecutionContextService,
          useValue: {
            getExecutionContext: jest.fn().mockResolvedValue({
              authContext: {},
              rolePermissionConfig: {},
            }),
          },
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getObjectMetadataInfo: jest.fn().mockResolvedValue({
              flatFieldMetadataMaps: { byUniversalIdentifier: {} },
            }),
          },
        },
      ],
    }).compile();

    action = module.get(FindRecordsWorkflowAction);
  });

  it('queries normally when there is no record filter to validate', async () => {
    const result = await action.execute({
      currentStepId: 'step-1',
      steps: [buildFindRecordsStep({ objectName: 'company' })],
      context: {},
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

    expect(mockFindRecordsService.execute).toHaveBeenCalled();
    expect(result).toEqual({
      result: { first: undefined, all: [], totalCount: 0 },
    });
  });

  it('throws when a filter value is still unresolved (undefined) after variable resolution', async () => {
    const step = buildFindRecordsStep({
      objectName: 'company',
      filter: {
        recordFilters: [
          {
            id: 'filter-1',
            fieldMetadataId: 'field-1',
            type: 'UUID',
            operand: ViewFilterOperand.IS,
            value: undefined,
          },
        ],
      },
    });

    await expect(
      action.execute({
        currentStepId: 'step-1',
        steps: [step],
        context: {},
        runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
      }),
    ).rejects.toThrow(WorkflowStepExecutorException);

    expect(mockFindRecordsService.execute).not.toHaveBeenCalled();
  });

  it('returns an empty result instead of aborting when a filter value resolves to a legitimate null', async () => {
    // Reproduces #24042: a FIND_RECORDS filter driven by
    // `{{trigger.properties.after.companyId}}` where companyId is a real,
    // optional field that simply isn't set (e.g. person has no company).
    // The variable resolves successfully to `null`, not `undefined` - that
    // is valid business data, not a broken reference.
    const step = buildFindRecordsStep({
      objectName: 'company',
      filter: {
        recordFilters: [
          {
            id: 'filter-1',
            fieldMetadataId: 'field-1',
            type: 'UUID',
            operand: ViewFilterOperand.IS,
            value: null,
          },
        ],
      },
    });

    const result = await action.execute({
      currentStepId: 'step-1',
      steps: [step],
      context: {},
      runInfo: { workspaceId: 'workspace-1', workflowRunId: 'run-1' },
    });

    expect(result).toEqual({
      result: { first: undefined, all: [], totalCount: 0 },
    });
    expect(mockFindRecordsService.execute).not.toHaveBeenCalled();
  });
});
