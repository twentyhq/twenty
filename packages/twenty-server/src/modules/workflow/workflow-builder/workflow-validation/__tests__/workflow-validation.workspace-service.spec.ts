import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-validation.workspace-service';
import {
  type WorkflowAiAgentAction,
  type WorkflowCodeAction,
  type WorkflowFindRecordsAction,
  type WorkflowHttpRequestAction,
  type WorkflowIteratorAction,
  type WorkflowLogicFunctionAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowActionType } from 'twenty-shared/workflow';

const WORKSPACE_ID = 'workspace-id';

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: false },
  continueOnFailure: { value: false },
};

const buildService = ({
  objectIdByNameSingular = {},
  logicFunction = null,
}: {
  objectIdByNameSingular?: Record<string, string>;
  logicFunction?: object | null;
} = {}) => {
  const workflowCommonWorkspaceService = {
    getWorkflowVersionOrFail: jest.fn(),
    getFlatEntityMaps: jest.fn().mockResolvedValue({ objectIdByNameSingular }),
    getLogicFunctionById: jest
      .fn()
      .mockResolvedValue(logicFunction ?? undefined),
  } as unknown as jest.Mocked<WorkflowCommonWorkspaceService>;

  const workflowSchemaWorkspaceService = {
    computeStepOutputSchema: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<WorkflowSchemaWorkspaceService>;

  return new WorkflowValidationWorkspaceService(
    workflowCommonWorkspaceService,
    workflowSchemaWorkspaceService,
  );
};

const buildAiAgentStep = (input: {
  agentId?: string;
  prompt?: string;
}): WorkflowAiAgentAction => ({
  id: 'ai-agent-step',
  name: 'AI Agent',
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  settings: {
    input,
    outputSchema: {
      result: { isLeaf: true, type: 'string', label: 'result', value: '' },
    },
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildHttpRequestStep = (
  outputSchema: OutputSchema = {},
): WorkflowHttpRequestAction => ({
  id: 'http-request-step',
  name: 'HTTP Request',
  type: WorkflowActionType.HTTP_REQUEST,
  valid: true,
  settings: {
    input: {
      url: 'https://example.com',
      method: 'GET',
      headers: {},
      body: {},
    },
    outputSchema,
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildWebhookTrigger = (outputSchema: object = {}): WorkflowTrigger =>
  ({
    type: WorkflowTriggerType.WEBHOOK,
    name: 'Webhook',
    settings: {
      outputSchema,
      httpMethod: 'GET',
      authentication: null,
    },
  }) as unknown as WorkflowTrigger;

const buildFindRecordsStep = (
  objectName: string,
): WorkflowFindRecordsAction => ({
  id: 'find-records-step',
  name: 'Find Records',
  type: WorkflowActionType.FIND_RECORDS,
  valid: true,
  settings: {
    input: { objectName },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildCodeStep = (expectedOutputSchema?: object): WorkflowCodeAction => ({
  id: 'code-step',
  name: 'Code',
  type: WorkflowActionType.CODE,
  valid: true,
  settings: {
    input: {
      logicFunctionId: 'logic-function-id',
      logicFunctionInput: {},
    },
    outputSchema: {},
    ...(expectedOutputSchema ? { expectedOutputSchema } : {}),
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const FIND_RECORDS_OUTPUT_SCHEMA = {
  first: {
    isLeaf: false,
    label: 'First',
    value: {
      _outputSchemaType: 'RECORD',
      object: { objectMetadataId: 'company-metadata-id', label: 'Company' },
      fields: {
        name: {
          isLeaf: true,
          type: 'TEXT',
          label: 'Company Name',
          value: 'Acme',
          fieldMetadataId: 'company-name-id',
          isCompositeSubField: false,
        },
      },
    },
  },
  all: {
    isLeaf: true,
    label: 'All',
    value: 'Returns an array of records',
    type: 'array',
  },
  totalCount: {
    isLeaf: true,
    label: 'Total Count',
    value: 42,
    type: 'number',
  },
};

const buildFindRecordsStepWithOutputSchema = (
  outputSchema: object,
): WorkflowFindRecordsAction => ({
  id: 'find-records-step',
  name: 'Find Records',
  type: WorkflowActionType.FIND_RECORDS,
  valid: true,
  settings: {
    input: { objectName: 'company' },
    outputSchema: outputSchema as OutputSchema,
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildIteratorStep = (items: string | unknown[]): WorkflowIteratorAction =>
  ({
    id: 'iterator-step',
    name: 'Iterator',
    type: WorkflowActionType.ITERATOR,
    valid: true,
    settings: {
      input: { items, initialLoopStepIds: ['body-step'] },
      errorHandlingOptions: ERROR_HANDLING_OPTIONS,
    },
  }) as unknown as WorkflowIteratorAction;

const buildLogicFunctionDefinition = (
  properties: Record<string, { type: string; label: string }>,
): object => ({
  workflowActionTriggerSettings: {
    outputSchema: [{ type: 'object', label: 'Output', properties }],
  },
});

const buildLogicFunctionStep = (
  expectedOutputSchema?: object,
): WorkflowLogicFunctionAction => ({
  id: 'logic-function-step',
  name: 'Logic Function',
  type: WorkflowActionType.LOGIC_FUNCTION,
  valid: true,
  settings: {
    input: {
      logicFunctionId: 'logic-function-id',
      logicFunctionInput: {},
    },
    outputSchema: {},
    ...(expectedOutputSchema ? { expectedOutputSchema } : {}),
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

describe('WorkflowValidationWorkspaceService', () => {
  it('should flag an AI Agent step that has no agent selected', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildAiAgentStep({})],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'AI_AGENT_MISSING_AGENT',
    );
  });

  it('should not flag an AI Agent step that has an agent selected', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildAiAgentStep({ agentId: 'agent-1' })],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'AI_AGENT_MISSING_AGENT',
    );
  });

  it('should flag a record step targeting an object that does not exist in the workspace', async () => {
    const service = buildService({ objectIdByNameSingular: {} });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildFindRecordsStep('ghost')],
    });

    expect(
      result.errors.some((issue) =>
        issue.message.includes('does not exist in this workspace'),
      ),
    ).toBe(true);
  });

  it('should not flag a record step targeting an existing object', async () => {
    const service = buildService({
      objectIdByNameSingular: { person: 'object-id-1' },
    });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildFindRecordsStep('person')],
    });

    expect(
      result.errors.some((issue) =>
        issue.message.includes('does not exist in this workspace'),
      ),
    ).toBe(false);
  });

  it('should error about a code step that has no output schema', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildCodeStep()],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should not warn about a code step that declares an expected output schema', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildCodeStep({ greeting: 'hello' })],
    });

    expect(result.warnings.map((issue) => issue.code)).not.toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should error about a logic function step with no output schema from any source', async () => {
    const service = buildService({ logicFunction: null });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildLogicFunctionStep()],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should not warn about a logic function step whose definition declares an output schema', async () => {
    const service = buildService({
      logicFunction: buildLogicFunctionDefinition({
        result: { type: 'string', label: 'result' },
      }),
    });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildLogicFunctionStep()],
    });

    expect(result.warnings.map((issue) => issue.code)).not.toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should not warn about a logic function step that declares an expected output schema on the step', async () => {
    const service = buildService({ logicFunction: null });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildLogicFunctionStep({ greeting: 'hello' })],
    });

    expect(result.warnings.map((issue) => issue.code)).not.toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should warn when the logic function step expected output schema does not match the declared output schema', async () => {
    const service = buildService({
      logicFunction: buildLogicFunctionDefinition({
        result: { type: 'string', label: 'result' },
      }),
    });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildLogicFunctionStep({ result: 123 })],
    });

    expect(result.warnings.map((issue) => issue.code)).toContain(
      'LOGIC_FUNCTION_OUTPUT_SCHEMA_MISMATCH',
    );
  });

  it('should not warn when the logic function step expected output schema matches the declared output schema', async () => {
    const service = buildService({
      logicFunction: buildLogicFunctionDefinition({
        result: { type: 'string', label: 'result' },
      }),
    });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildLogicFunctionStep({ result: 'hello' })],
    });

    expect(result.warnings.map((issue) => issue.code)).not.toContain(
      'LOGIC_FUNCTION_OUTPUT_SCHEMA_MISMATCH',
    );
  });

  it('should error about an HTTP request step that has no output schema', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildHttpRequestStep({})],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should not error about an HTTP request step that declares an output schema', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [
        buildHttpRequestStep({
          status: { isLeaf: true, type: 'number', label: 'status', value: 200 },
        }),
      ],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should warn when a variable-consuming step references no variable', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildHttpRequestStep({})],
    });

    expect(result.warnings.map((issue) => issue.code)).toContain(
      'STEP_HAS_NO_VARIABLE_REFERENCE',
    );
  });

  it('should not warn about a missing variable reference when the step references a variable', async () => {
    const service = buildService();

    const httpRequestStepWithVariable = buildHttpRequestStep({});

    httpRequestStepWithVariable.settings.input.body = {
      name: '{{trigger.body.name}}',
    };

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [httpRequestStepWithVariable],
    });

    expect(result.warnings.map((issue) => issue.code)).not.toContain(
      'STEP_HAS_NO_VARIABLE_REFERENCE',
    );
  });

  it('should error about a webhook trigger that has no output schema', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: buildWebhookTrigger({}),
      steps: [buildFindRecordsStep('person')],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should not error about a webhook trigger that declares an output schema', async () => {
    const service = buildService({
      objectIdByNameSingular: { person: 'object-id-1' },
    });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: buildWebhookTrigger({
        body: { isLeaf: false, type: 'object', label: 'body', value: {} },
      }),
      steps: [buildFindRecordsStep('person')],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    );
  });

  it('should flag an iterator whose items reference a non-array path and suggest array paths', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [
        buildFindRecordsStepWithOutputSchema(FIND_RECORDS_OUTPUT_SCHEMA),
        buildIteratorStep('{{find-records-step.first}}'),
      ],
    });

    const iteratorIssue = result.errors.find(
      (issue) => issue.code === 'ITERATOR_ITEMS_NOT_ARRAY',
    );

    expect(iteratorIssue).toBeDefined();
    expect(iteratorIssue?.suggestions).toContain('find-records-step.all');
  });

  it('should not flag an iterator whose items reference an array path', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [
        buildFindRecordsStepWithOutputSchema(FIND_RECORDS_OUTPUT_SCHEMA),
        buildIteratorStep('{{find-records-step.all}}'),
      ],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'ITERATOR_ITEMS_NOT_ARRAY',
    );
  });

  it('should not flag an iterator that iterates over an inline array', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildIteratorStep(['one', 'two'])],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'ITERATOR_ITEMS_NOT_ARRAY',
    );
  });
});
