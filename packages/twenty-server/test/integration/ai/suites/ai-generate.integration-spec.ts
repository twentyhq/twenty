import { APICallError } from '@ai-sdk/provider';
import { generateQueryFactory } from 'test/integration/ai/utils/generate-query-factory.util';
import {
  answerWith,
  mockScriptedAiModel,
  SCRIPTED_MODEL_USAGE,
} from 'test/integration/ai/utils/mock-scripted-ai-model.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type ScriptedModelResponse } from 'test/utils/scripted-model-response.type';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { type GenerateMutationInput } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const DATA_TOOL_NAME_PATTERN =
  /^(find_many|find_one|group_by|create_one|create_many|update_one|update_many|delete_one|delete_many|upsert_many|merge_many)_/;

const failWith = (message: string): ScriptedModelResponse => ({
  ...answerWith(''),
  streamError: new APICallError({
    message,
    url: 'https://provider.test',
    requestBodyValues: {},
    statusCode: 400,
  }),
});

const generate = async (input: Omit<GenerateMutationInput, 'modelId'>) => {
  const response = await makeMetadataApiRequest(generateQueryFactory(input));

  expect(response.body.errors).toBeUndefined();

  return response.body.data.generate;
};

describe('generate mutation (integration)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the text of the reply with its run and usage', async () => {
    mockScriptedAiModel(() => answerWith('Acme looks like a fit'));

    expect(
      await generate({ input: [{ role: 'user', content: 'Qualify Acme' }] }),
    ).toEqual({
      success: true,
      text: 'Acme looks like a fit',
      object: null,
      error: null,
      runId: expect.any(String),
      usage: { inputTokens: 12, outputTokens: 3 },
    });
  });

  it('returns the object of a json response format from one model call', async () => {
    const offeredToolNamesByCall = mockScriptedAiModel(() =>
      answerWith(JSON.stringify({ fit: true })),
    );

    const result = await generate({
      input: [{ role: 'user', content: 'Qualify Acme' }],
      responseFormat: {
        type: 'json',
        schema: { type: 'object', properties: { fit: { type: 'boolean' } } },
      },
    });

    expect(result).toMatchObject({
      success: true,
      text: null,
      object: { fit: true },
    });
    expect(offeredToolNamesByCall).toHaveLength(1);
  });

  it('offers the model no data tools without a scope', async () => {
    const offeredToolNamesByCall = mockScriptedAiModel(() =>
      answerWith('Done'),
    );

    await generate({ input: [{ role: 'user', content: 'List the people' }] });

    expect(
      offeredToolNamesByCall[0].filter((toolName) =>
        DATA_TOOL_NAME_PATTERN.test(toolName),
      ),
    ).toEqual([]);
  });

  it('reports a failing model in the result instead of a GraphQL error', async () => {
    mockScriptedAiModel(() => failWith('Invalid request'));

    expect(
      await generate({ input: [{ role: 'user', content: 'Qualify Acme' }] }),
    ).toMatchObject({
      success: false,
      text: null,
      object: null,
      error: expect.stringContaining('Invalid request'),
      runId: expect.any(String),
      usage: { inputTokens: 0, outputTokens: 0 },
    });
  });

  it('reports the usage of the steps that finished before the model failed', async () => {
    const callMissingTool: ScriptedModelResponse = {
      content: [
        {
          type: 'tool-call',
          toolCallId: 'missing-1',
          toolName: 'missing_tool',
          input: '{}',
        },
      ],
      finishReason: { unified: 'tool-calls', raw: undefined },
      usage: SCRIPTED_MODEL_USAGE,
    };

    mockScriptedAiModel((callIndex) =>
      callIndex === 0 ? callMissingTool : failWith('Invalid request'),
    );

    expect(
      await generate({ input: [{ role: 'user', content: 'Qualify Acme' }] }),
    ).toMatchObject({
      success: false,
      error: expect.stringContaining('Invalid request'),
      runId: expect.any(String),
      usage: { inputTokens: 12, outputTokens: 3 },
    });
  });
});

describe('generate mutation for an application without a default role (integration)', () => {
  let application: ApplicationWithResources;
  let memberBoundToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Generate Roleless Probe',
    });

    await globalThis.testDataSource.query(
      'UPDATE core."application" SET "defaultRoleId" = NULL WHERE id = $1',
      [application.id],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatApplicationMaps']);

    memberBoundToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      })
    ).applicationAccessToken.token;
  }, 120000);

  beforeEach(() => jest.useRealTimers());

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  it('refuses a member-bound application rather than run with the member role alone', async () => {
    mockScriptedAiModel(() => answerWith('Acme looks like a fit'));

    const response = await makeMetadataApiRequest(
      generateQueryFactory({
        input: [{ role: 'user', content: 'Qualify Acme' }],
      }),
      memberBoundToken,
    );

    expect(response.body.errors?.[0]).toMatchObject({
      message: expect.stringContaining('needs a default role'),
      extensions: { code: 'FORBIDDEN' },
    });
  });
});
