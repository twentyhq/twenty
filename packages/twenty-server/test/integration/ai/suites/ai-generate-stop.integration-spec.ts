import { randomUUID } from 'node:crypto';

import { followAgentRunEventsOrThrow } from 'test/integration/ai/utils/follow-agent-run-events.util';
import {
  generateQueryFactory,
  type GenerateTestInput,
} from 'test/integration/ai/utils/generate-query-factory.util';
import {
  answerWith,
  mockScriptedAiModel,
} from 'test/integration/ai/utils/mock-scripted-ai-model.util';
import { stopGenerateQueryFactory } from 'test/integration/ai/utils/stop-generate-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type ScriptedModelResponse } from 'test/utils/scripted-model-response.type';
import { isAgentChatTurnEndEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_RUN_STOPPED_ERROR } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stopped-error.constant';

const INPUT = [{ role: 'user' as const, content: 'Qualify Acme' }];
const GENERATE_TIMEOUT_MS = 30_000;
const WAIT_TIMEOUT_MS = 10_000;

const waitForOrThrow = async (isDone: () => boolean) => {
  const startedAt = Date.now();

  while (!isDone()) {
    if (Date.now() - startedAt > WAIT_TIMEOUT_MS) {
      throw new Error('Timed out waiting for the run');
    }

    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

type GenerateBody = {
  data: { generate: Record<string, unknown> };
  errors?: { extensions: { code: string } }[];
};

const stopGenerate = ({
  runId,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  runId: string;
  token?: string;
}) => makeMetadataApiRequest(stopGenerateQueryFactory({ runId }), token);

const generate = ({
  runId,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  input = {},
}: {
  runId: string;
  token?: string;
  input?: Partial<GenerateTestInput>;
}) =>
  makeMetadataApiRequest(
    generateQueryFactory({ input: INPUT, runId, ...input }),
    token,
  )
    .timeout(GENERATE_TIMEOUT_MS)
    .then((response) => response.body);

const JSON_RESPONSE_FORMAT: GenerateTestInput['responseFormat'] = {
  type: 'json',
  schema: { type: 'object', properties: { fit: { type: 'boolean' } } },
};

// later calls answer only once aborted, as a provider request would, so a run stays open until stopped
const mockModelThatWaitsForAbort = (
  scriptedAnswers: ScriptedModelResponse[] = [],
) => {
  let waitingCallCount = 0;

  mockScriptedAiModel(({ callIndex, options: { abortSignal } }) => {
    const scriptedAnswer = scriptedAnswers[callIndex];

    if (isDefined(scriptedAnswer)) {
      return scriptedAnswer;
    }

    return new Promise((_resolve, reject) => {
      waitingCallCount++;

      if (abortSignal?.aborted) {
        reject(abortSignal.reason);

        return;
      }

      abortSignal?.addEventListener('abort', () => reject(abortSignal.reason), {
        once: true,
      });
    });
  });

  return { getWaitingCallCount: () => waitingCallCount };
};

const expectStopped = (generateBody: GenerateBody, runId: string) => {
  expect(generateBody.errors).toBeUndefined();
  expect(generateBody.data.generate).toMatchObject({
    success: false,
    error: AGENT_RUN_STOPPED_ERROR,
    runId,
  });
};

describe('stopGenerate (integration)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('stops a run its caller follows while the model is answering, and ends its stream', async () => {
    const runId = randomUUID();
    const model = mockModelThatWaitsForAbort();
    const stream = await followAgentRunEventsOrThrow({
      runId,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    try {
      await waitForOrThrow(() => stream.events.length > 0);

      const generation = generate({ runId });

      await waitForOrThrow(() => model.getWaitingCallCount() > 0);

      const stopResponse = await stopGenerate({ runId });

      expect(stopResponse.body.errors).toBeUndefined();
      expect(stopResponse.body.data.stopGenerate).toBe(true);

      expectStopped(await generation, runId);

      await waitForOrThrow(() => stream.events.some(isAgentChatTurnEndEvent));
    } finally {
      await stream.close();
    }

    expect(stream.errors).toEqual([]);
  });

  it('stops a run stopped before it started', async () => {
    const runId = randomUUID();
    mockModelThatWaitsForAbort();

    await stopGenerate({ runId });

    expectStopped(await generate({ runId }), runId);
  });

  it('leaves a run alone when another member names its run id, without telling them it exists', async () => {
    const runId = randomUUID();

    mockScriptedAiModel(() => answerWith('Acme looks like a fit'));

    const stopResponse = await stopGenerate({
      runId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(stopResponse.body.errors).toBeUndefined();
    expect(stopResponse.body.data.stopGenerate).toBe(true);

    const generateBody = await generate({ runId });

    expect(generateBody.data.generate).toMatchObject({
      success: true,
      text: 'Acme looks like a fit',
      runId,
    });
  });

  it('stops a JSON run while the model is answering', async () => {
    const runId = randomUUID();
    const model = mockModelThatWaitsForAbort();
    const generation = generate({
      runId,
      input: { responseFormat: JSON_RESPONSE_FORMAT },
    });

    await waitForOrThrow(() => model.getWaitingCallCount() > 0);
    await stopGenerate({ runId });

    expectStopped(await generation, runId);
  });

  it('stops a JSON run with tools during the request for its structured output', async () => {
    const runId = randomUUID();
    const model = mockModelThatWaitsForAbort([answerWith('Acme is a fit')]);
    const generation = generate({
      runId,
      input: {
        responseFormat: JSON_RESPONSE_FORMAT,
        scope: { canReadAllObjectRecords: true },
      },
    });

    await waitForOrThrow(() => model.getWaitingCallCount() > 0);
    await stopGenerate({ runId });

    expectStopped(await generation, runId);
  });

  it('can still stop a run when a duplicate request with its run id is refused', async () => {
    const runId = randomUUID();
    const model = mockModelThatWaitsForAbort();
    const generations = [1, 2].map(() => generate({ runId }));
    const settled: GenerateBody[] = [];

    for (const generation of generations) {
      void generation.then((generateBody) => settled.push(generateBody));
    }

    await waitForOrThrow(
      () => model.getWaitingCallCount() > 0 && settled.length > 0,
    );
    expect(settled[0].errors?.[0].extensions.code).toBe('BAD_USER_INPUT');

    await stopGenerate({ runId });
    await waitForOrThrow(() => settled.length === 2);

    expectStopped(settled[1], runId);
  });

  it('refuses an API key, which no member or application owns', async () => {
    const response = await stopGenerate({
      runId: randomUUID(),
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
