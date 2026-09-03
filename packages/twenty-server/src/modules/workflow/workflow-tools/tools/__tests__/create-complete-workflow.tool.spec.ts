import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';

const ITERATOR_STEP_ID = '11111111-1111-4111-8111-111111111111';
const LOOP_BODY_STEP_ID = '22222222-2222-4222-8222-222222222222';

const buildTool = () => {
  const workflowVersionEdgeService = {
    createWorkflowVersionEdge: jest.fn().mockResolvedValue({}),
  };
  const workflowValidationService = {
    validateWorkflowVersion: jest
      .fn()
      .mockResolvedValue({ valid: true, errors: [], warnings: [] }),
    validateWorkflowDefinition: jest
      .fn()
      .mockResolvedValue({ valid: true, errors: [], warnings: [] }),
  };
  const workflowVersionService = {
    autoLayoutWorkflowVersion: jest.fn().mockResolvedValue(undefined),
  };
  const workflowTriggerService = {
    activateWorkflowVersion: jest.fn().mockResolvedValue(undefined),
  };
  const recordPositionService = {
    buildRecordPosition: jest.fn().mockResolvedValue(1),
  };
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback) => callback()),
    getRepository: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
    })),
  };
  const workflowVersionCoreSyncService = {
    writeWorkflowVersionAndMirror: jest.fn((_workspaceId, callback) =>
      callback({ insert: jest.fn().mockResolvedValue(undefined) }),
    ),
  };

  const tool = createCreateCompleteWorkflowTool(
    {
      workflowVersionService,
      workflowVersionEdgeService,
      workflowTriggerService,
      workspaceOrmManager,
      recordPositionService,
      workflowValidationService,
      workflowVersionCoreSyncService,
    } as never,
    { workspaceId: 'workspace-id', rolePermissionConfig: {} } as never,
  );

  return { tool, workflowVersionEdgeService, workflowValidationService };
};

const buildInput = (
  edges: Array<Record<string, unknown>>,
): Parameters<
  ReturnType<typeof createCreateCompleteWorkflowTool>['execute']
>[0] =>
  ({
    name: 'Loop over records',
    trigger: { type: 'MANUAL', settings: {} },
    steps: [
      {
        id: ITERATOR_STEP_ID,
        name: 'Loop',
        type: 'ITERATOR',
        valid: true,
        settings: { input: { items: '{{trigger.records}}' } },
      },
      {
        id: LOOP_BODY_STEP_ID,
        name: 'Create note',
        type: 'CREATE_RECORD',
        valid: true,
        settings: { input: { objectName: 'note', objectRecord: {} } },
      },
    ],
    edges,
  }) as never;

describe('createCreateCompleteWorkflowTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should forward an edge sourceConnectionOptions to createWorkflowVersionEdge', async () => {
    const { tool, workflowVersionEdgeService } = buildTool();

    await tool.execute(
      buildInput([
        { source: 'trigger', target: ITERATOR_STEP_ID },
        {
          source: ITERATOR_STEP_ID,
          target: LOOP_BODY_STEP_ID,
          sourceConnectionOptions: {
            connectedStepType: 'ITERATOR',
            settings: { isConnectedToLoop: true },
          },
        },
        { source: LOOP_BODY_STEP_ID, target: ITERATOR_STEP_ID },
      ]),
    );

    expect(
      workflowVersionEdgeService.createWorkflowVersionEdge,
    ).toHaveBeenCalledTimes(3);
    expect(
      workflowVersionEdgeService.createWorkflowVersionEdge,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        source: ITERATOR_STEP_ID,
        target: LOOP_BODY_STEP_ID,
        sourceConnectionOptions: {
          connectedStepType: 'ITERATOR',
          settings: { isConnectedToLoop: true },
        },
      }),
    );
  });

  it('should validate the persisted workflow version rather than the submitted steps', async () => {
    const { tool, workflowValidationService } = buildTool();

    const response = (await tool.execute(
      buildInput([{ source: 'trigger', target: ITERATOR_STEP_ID }]),
    )) as { result: { workflowVersionId: string } };

    expect(
      workflowValidationService.validateWorkflowDefinition,
    ).not.toHaveBeenCalled();
    expect(
      workflowValidationService.validateWorkflowVersion,
    ).toHaveBeenCalledTimes(1);
    expect(
      workflowValidationService.validateWorkflowVersion,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workflowVersionId: response.result.workflowVersionId,
    });
  });
});
