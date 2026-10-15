import { randomUUID } from 'node:crypto';

import { writeFileSync } from 'node:fs';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const USAGE = {
  inputTokens: {
    total: 1,
    noCache: 1,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

type ModelCall = {
  toolNames: string[];
  systemPrompt: string;
};

// The model answers at once, so a test sees what a turn offers it before any tool runs
const mockAnsweringModel = (): ModelCall[] => {
  const calls: ModelCall[] = [];
  const model = createScriptedLanguageModel((options) => {
    calls.push({
      toolNames: (options.tools ?? []).map((tool) => tool.name).sort(),
      systemPrompt: options.prompt
        .flatMap((message) =>
          message.role === 'system' ? [message.content] : [],
        )
        .join('\n\n'),
    });

    return {
      content: [{ type: 'text', text: 'Done' }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: USAGE,
    };
  });

  jest
    .spyOn(
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      ),
      'resolveModelForAgent',
    )
    .mockReturnValue({
      modelId: TEST_AI_MODEL_ID,
      sdkPackage: '@ai-sdk/openai',
      model,
    } as unknown as RegisteredAiModel);

  return calls;
};

const recordSystemPrompt = (name: string, systemPrompt: string) => {
  if (process.env.AGENT_TURN_CONTEXT_PROMPT_DIR) {
    writeFileSync(
      `${process.env.AGENT_TURN_CONTEXT_PROMPT_DIR}/${name}.txt`,
      systemPrompt,
    );
  }
};

describe('what an agent turn offers the model (integration)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('offers a chat turn the assistant tools', async () => {
    const calls = mockAnsweringModel();
    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );

    jest
      .spyOn(aiModelRegistryService, 'getAvailableModels')
      .mockReturnValue([{ modelId: TEST_AI_MODEL_ID }] as never);
    const threadId = randomUUID();

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation SendChatMessage(
          $threadId: UUID!
          $text: String!
          $messageId: UUID!
        ) {
          sendChatMessage(
            threadId: $threadId
            text: $text
            messageId: $messageId
          ) {
            queued
          }
        }
      `,
      variables: { threadId, text: 'Hello', messageId: randomUUID() },
    });

    expect(response.body.errors).toBeUndefined();

    await expectEventually(async () => {
      const [assistantMessage] = await global.testDataSource.query(
        `SELECT id FROM "${schema}"."agentMessage" WHERE "threadId" = $1 AND role = 'assistant'`,
        [threadId],
      );

      expect(assistantMessage).toBeDefined();
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].toolNames).toMatchSnapshot();
    for (const section of [
      '## User Context',
      '## Available Tools',
      '### Pre-loaded Tools (ready to use now)',
      '### Tool Catalog by Category',
      '## Available Skills',
    ]) {
      expect(calls[0].systemPrompt).toContain(section);
    }
    recordSystemPrompt('chat', calls[0].systemPrompt);

    await destroyAgentChatThread({ threadId });
  });

  it('offers a runAgent call its agent tools', async () => {
    const calls = mockAnsweringModel();
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Turn context agent role',
        description: 'Reads every record',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });
    const roleId = roleData.createOneRole.id;
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Turn Context Agent',
        prompt: 'Answer what you are asked',
        modelId: TEST_AI_MODEL_ID,
        roleId,
      },
    });
    const agentId = data.createOneAgent.id;
    const [{ universalIdentifier }] = await global.testDataSource.query(
      `SELECT "universalIdentifier" FROM core.agent WHERE id = $1`,
      [agentId],
    );

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation RunAgent($input: RunAgentInput!) {
          runAgent(input: $input) {
            status
          }
        }
      `,
      variables: {
        input: {
          agentUniversalIdentifier: universalIdentifier,
          input: [{ role: 'user', content: 'Hello' }],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.runAgent.status).toBe('COMPLETED');
    expect(calls).toHaveLength(1);
    expect(calls[0].toolNames).toMatchSnapshot();
    for (const section of [
      'invoked programmatically',
      'wait_for_event',
      'Answer what you are asked',
      '### Tool Catalog by Category',
    ]) {
      expect(calls[0].systemPrompt).toContain(section);
    }
    recordSystemPrompt('run-agent', calls[0].systemPrompt);

    await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });
  });
});
