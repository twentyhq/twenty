import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { CoreWorkflowTriggerService } from 'src/engine/core-modules/workflow/services/core-workflow-trigger.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { WorkflowAiAgentStepAgentService } from 'src/modules/workflow/workflow-builder/workflow-version-step/services/workflow-ai-agent-step-agent.service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { type WorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const WORKSPACE_ID = 'workspace-id';

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

const MCP_SERVER_ID = 'mcp-server-id';
const MCP_SERVER_UNIVERSAL_IDENTIFIER = 'mcp-server-universal-identifier';

const buildFlatMcpServer = (): FlatMcpServer => ({
  id: MCP_SERVER_ID,
  universalIdentifier: MCP_SERVER_UNIVERSAL_IDENTIFIER,
  workspaceId: WORKSPACE_ID,
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  name: 'docs',
  label: 'Docs',
  url: 'https://docs.example.com/mcp',
  connectionProviderId: null,
  connectionProviderUniversalIdentifier: null,
  isActive: true,
  tools: [
    {
      name: 'search_docs',
      description: null,
      annotations: null,
      inputSchema: {
        type: 'object',
        properties: { sort: { type: 'string', enum: ['asc', 'desc'] } },
      },
    },
  ],
  toolsSyncedAt: null,
  toolsSyncError: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const flatEntityMapsCacheServiceWithMcpServer = {
  getOrRecomputeManyOrAllFlatEntityMaps: async () => ({
    flatMcpServerMaps: {
      byUniversalIdentifier: {
        [MCP_SERVER_UNIVERSAL_IDENTIFIER]: buildFlatMcpServer(),
      },
      universalIdentifierById: {
        [MCP_SERVER_ID]: MCP_SERVER_UNIVERSAL_IDENTIFIER,
      },
      universalIdentifiersByApplicationId: {},
    },
  }),
};

const buildService = async ({
  flatEntityMapsCacheService = {},
  featureFlagService = {},
}: {
  flatEntityMapsCacheService?: object;
  featureFlagService?: object;
} = {}) => {
  const testingModule = await Test.createTestingModule({
    providers: [
      WorkflowVersionStepOperationsWorkspaceService,
      { provide: WorkspaceOrmManager, useValue: {} },
      {
        provide: getWorkspaceScopedRepositoryToken(ObjectMetadataEntity),
        useValue: {},
      },
      { provide: WorkflowMetadataReadService, useValue: {} },
      { provide: WorkspaceCacheService, useValue: {} },
      {
        provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
        useValue: flatEntityMapsCacheService,
      },
      { provide: CoreWorkflowTriggerService, useValue: {} },
      { provide: FindRecordsService, useValue: {} },
      { provide: FeatureFlagService, useValue: featureFlagService },
      { provide: WorkflowAiAgentStepAgentService, useValue: {} },
    ],
  }).compile();

  return testingModule.get(WorkflowVersionStepOperationsWorkspaceService);
};

describe('WorkflowVersionStepOperationsWorkspaceService code steps', () => {
  it('creates a CODE step holding the seed source and no logic function', async () => {
    const service = await buildService();

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.CODE,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
    });

    expect(builtStep.type).toBe(WorkflowActionType.CODE);
    expect(builtStep.settings.input).toEqual({
      code: expect.stringContaining('export const main'),
      logicFunctionInput: { a: null, b: null },
    });
  });

  it('creates a CODE step with the given source and input', async () => {
    const service = await buildService();

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.CODE,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
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
    const service = await buildService();
    const step = buildCodeStep({
      code: 'export const main = async () => ({});',
      logicFunctionInput: {},
    });

    const clonedStep = await service.cloneStep({
      step,
      workspaceId: WORKSPACE_ID,
    });

    expect(clonedStep.id).not.toBe(step.id);
    expect(clonedStep.settings).toEqual(step.settings);
  });
});

describe('WorkflowVersionStepOperationsWorkspaceService duplicate steps', () => {
  it('places a duplicate next to a positioned source step', async () => {
    const service = await buildService();
    const step = {
      ...buildCodeStep({ code: '', logicFunctionInput: {} }),
      position: { x: 100, y: 200 },
    };

    expect(service.markStepAsDuplicate({ step }).position).toEqual({
      x: 150,
      y: 250,
    });
  });

  it('leaves a duplicate unpositioned when its source step has no position', async () => {
    const service = await buildService();
    const step = buildCodeStep({ code: '', logicFunctionInput: {} });

    expect(service.markStepAsDuplicate({ step }).position).toBeUndefined();
  });
});

describe('WorkflowVersionStepOperationsWorkspaceService MCP tool steps', () => {
  it('seeds untouched optional tool inputs with null', async () => {
    const service = await buildService({
      flatEntityMapsCacheService: flatEntityMapsCacheServiceWithMcpServer,
      featureFlagService: { isFeatureEnabled: async () => true },
    });

    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.MCP_TOOL,
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: undefined,
      defaultSettings: {
        input: { mcpServerId: MCP_SERVER_ID, toolName: 'search_docs' },
      },
    });

    expect(builtStep.settings.input).toEqual({
      mcpServerId: MCP_SERVER_ID,
      toolName: 'search_docs',
      toolInput: { sort: null },
    });
  });
});
