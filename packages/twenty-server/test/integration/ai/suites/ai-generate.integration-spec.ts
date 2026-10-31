import { APICallError } from '@ai-sdk/provider';
import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { type ScriptedModelResponse } from 'test/utils/scripted-model-response.type';
import { type GenerateInput } from 'twenty-shared/application';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

const DATA_TOOL_NAME_PATTERN =
  /^(find_many|find_one|group_by|create_one|create_many|update_one|update_many|delete_one|delete_many|upsert_many|merge_many)_/;

const USAGE = {
  inputTokens: {
    total: 12,
    noCache: 12,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 3, text: 3, reasoning: undefined },
};

const answerWith = (text: string): ScriptedModelResponse => ({
  content: [{ type: 'text', text }],
  finishReason: { unified: 'stop', raw: undefined },
  usage: USAGE,
});

const mockModel = (respond: () => ScriptedModelResponse) => {
  const offeredToolNamesByCall: string[][] = [];
  const model = createScriptedLanguageModel((options) => {
    offeredToolNamesByCall.push((options.tools ?? []).map((tool) => tool.name));

    return respond();
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

  return offeredToolNamesByCall;
};

const generate = async (input: Omit<GenerateInput, 'modelId'>) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      mutation Generate($input: GenerateInput!) {
        generate(input: $input) {
          success
          text
          object
          error
          turnId
          usage {
            inputTokens
            outputTokens
          }
        }
      }
    `,
    variables: { input: { ...input, modelId: TEST_AI_MODEL_ID } },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.generate;
};

describe('generate mutation (integration)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns the text of the reply with its turn and usage', async () => {
    mockModel(() => answerWith('Acme looks like a fit'));

    expect(
      await generate({ input: [{ role: 'user', content: 'Qualify Acme' }] }),
    ).toEqual({
      success: true,
      text: 'Acme looks like a fit',
      object: null,
      error: null,
      turnId: expect.any(String),
      usage: { inputTokens: 12, outputTokens: 3 },
    });
  });

  it('returns the object of a json response format from one model call', async () => {
    const offeredToolNamesByCall = mockModel(() =>
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
    const offeredToolNamesByCall = mockModel(() => answerWith('Done'));

    await generate({ input: [{ role: 'user', content: 'List the people' }] });

    expect(
      offeredToolNamesByCall[0].filter((toolName) =>
        DATA_TOOL_NAME_PATTERN.test(toolName),
      ),
    ).toEqual([]);
  });

  it('reports a failing model in the result instead of a GraphQL error', async () => {
    mockModel(() => ({
      ...answerWith(''),
      streamError: new APICallError({
        message: 'Invalid request',
        url: 'https://provider.test',
        requestBodyValues: {},
        statusCode: 400,
      }),
    }));

    expect(
      await generate({ input: [{ role: 'user', content: 'Qualify Acme' }] }),
    ).toMatchObject({
      success: false,
      text: null,
      object: null,
      error: expect.stringContaining('Invalid request'),
    });
  });
});
