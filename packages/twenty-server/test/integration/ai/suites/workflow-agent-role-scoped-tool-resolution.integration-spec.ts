jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  generateText: jest.fn().mockResolvedValue({
    text: '',
    steps: [],
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      inputTokenDetails: {
        noCacheTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
    },
  }),
}));

import { generateText } from 'ai';
import { type Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

describe('Workflow agent role-scoped tool resolution (integration)', () => {
  let agentWithRoleId: string;
  let agentWithoutRoleId: string;
  let roleId: string;
  let executor: AgentAsyncExecutorService;
  let toolRegistry: ToolRegistryService;
  let agentRepository: Repository<AgentEntity>;
  let getToolsByCategoriesSpy: jest.SpyInstance;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Workflow Agent Tool Resolution Test Role',
        description:
          'Role used to verify workflow agent role-scoped tool resolution',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    roleId = roleData.createOneRole.id;

    const { data: agentWithRoleData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Role-Assigned Tool Resolution Agent',
        prompt: 'Test prompt',
        modelId: 'openai/gpt-4.1',
        roleId,
      },
    });

    agentWithRoleId = agentWithRoleData.createOneAgent.id;

    const { data: agentWithoutRoleData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Roleless Tool Resolution Agent',
        prompt: 'Test prompt',
        modelId: 'openai/gpt-4.1',
      },
    });

    agentWithoutRoleId = agentWithoutRoleData.createOneAgent.id;

    executor = global.app.get(AgentAsyncExecutorService);
    toolRegistry = global.app.get(ToolRegistryService);
    agentRepository = global.app.get<Repository<AgentEntity>>(
      getRepositoryToken(AgentEntity),
    );
  });

  afterAll(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: agentWithRoleId },
    });
    await deleteOneAgent({
      expectToFail: false,
      input: { id: agentWithoutRoleId },
    });
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: roleId },
    });
  });

  beforeEach(() => {
    (generateText as jest.Mock).mockClear();
    getToolsByCategoriesSpy = jest.spyOn(toolRegistry, 'getToolsByCategories');
  });

  afterEach(() => {
    getToolsByCategoriesSpy.mockRestore();
  });

  it('resolves registry tools scoped to the agent role when the agent has a role', async () => {
    const agent = await agentRepository.findOneByOrFail({
      id: agentWithRoleId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    await executor.executeAgent({
      agent,
      userPrompt: 'test',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    expect(getToolsByCategoriesSpy).toHaveBeenCalledTimes(1);
    expect(getToolsByCategoriesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        roleId,
        rolePermissionConfig: { unionOf: [roleId] },
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
      expect.objectContaining({
        wrapWithErrorContext: false,
      }),
    );
  });

  it('does not resolve registry tools when the agent has no role (fail-closed)', async () => {
    const agent = await agentRepository.findOneByOrFail({
      id: agentWithoutRoleId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    await executor.executeAgent({
      agent,
      userPrompt: 'test',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    expect(getToolsByCategoriesSpy).not.toHaveBeenCalled();
  });

  it('never leaks caller-side rolePermissionConfig — agent role is the only source of truth', async () => {
    const agent = await agentRepository.findOneByOrFail({
      id: agentWithRoleId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    await executor.executeAgent({
      agent,
      userPrompt: 'test',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const [toolProviderContext] = getToolsByCategoriesSpy.mock.calls[0];

    expect(toolProviderContext.rolePermissionConfig).toEqual({
      unionOf: [roleId],
    });
    expect(toolProviderContext.rolePermissionConfig).not.toHaveProperty(
      'intersectionOf',
    );
  });
});
