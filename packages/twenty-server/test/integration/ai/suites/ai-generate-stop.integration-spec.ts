import { randomUUID } from 'node:crypto';

import { followAgentRunEventsOrThrow } from 'test/integration/ai/utils/follow-agent-run-events.util';
import { generateQueryFactory } from 'test/integration/ai/utils/generate-query-factory.util';
import {
  answerWith,
  mockScriptedAiModel,
} from 'test/integration/ai/utils/mock-scripted-ai-model.util';
import { stopGenerateQueryFactory } from 'test/integration/ai/utils/stop-generate-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isAgentChatTurnEndEvent } from 'twenty-shared/ai';

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

const stopGenerate = (runId: string, token: string) =>
  makeMetadataApiRequest(stopGenerateQueryFactory({ runId }), token);

const generate = (runId: string, token: string) =>
  makeMetadataApiRequest(generateQueryFactory({ input: INPUT, runId }), token)
    .timeout(GENERATE_TIMEOUT_MS)
    .then((response) => response.body);

// answers only once its call is aborted, as a provider's request would, so a run stays open until it is stopped
const mockModelThatWaitsForAbort = () => {
  let callCount = 0;

  mockScriptedAiModel(
    (_callIndex, { abortSignal }) =>
      new Promise((_resolve, reject) => {
        callCount++;

        if (abortSignal?.aborted === true) {
          reject(abortSignal.reason);

          return;
        }

        abortSignal?.addEventListener(
          'abort',
          () => reject(abortSignal.reason),
          { once: true },
        );
      }),
  );

  return { getCallCount: () => callCount };
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

      const generation = generate(runId, APPLE_JANE_ADMIN_ACCESS_TOKEN);

      await waitForOrThrow(() => model.getCallCount() > 0);

      const stopResponse = await stopGenerate(
        runId,
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
      );

      expect(stopResponse.body.errors).toBeUndefined();
      expect(stopResponse.body.data.stopGenerate).toBe(true);

      const generateBody = await generation;

      expect(generateBody.errors).toBeUndefined();
      expect(generateBody.data.generate).toMatchObject({
        success: false,
        error: AGENT_RUN_STOPPED_ERROR,
        runId,
      });

      await waitForOrThrow(() => stream.events.some(isAgentChatTurnEndEvent));
    } finally {
      await stream.close();
    }

    expect(stream.errors).toEqual([]);
  });

  it('stops a run stopped before it started', async () => {
    const runId = randomUUID();
    mockModelThatWaitsForAbort();

    await stopGenerate(runId, APPLE_JANE_ADMIN_ACCESS_TOKEN);

    const generateBody = await generate(runId, APPLE_JANE_ADMIN_ACCESS_TOKEN);

    expect(generateBody.errors).toBeUndefined();
    expect(generateBody.data.generate).toMatchObject({
      success: false,
      error: AGENT_RUN_STOPPED_ERROR,
      runId,
    });
  });

  it('leaves a run alone when another member names its run id, without telling them it exists', async () => {
    const runId = randomUUID();

    mockScriptedAiModel(() => answerWith('Acme looks like a fit'));

    const stopResponse = await stopGenerate(
      runId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(stopResponse.body.errors).toBeUndefined();
    expect(stopResponse.body.data.stopGenerate).toBe(true);

    const generateBody = await generate(runId, APPLE_JANE_ADMIN_ACCESS_TOKEN);

    expect(generateBody.data.generate).toMatchObject({
      success: true,
      text: 'Acme looks like a fit',
      runId,
    });
  });

  it('refuses an API key, which no member or application owns', async () => {
    const response = await stopGenerate(randomUUID(), API_KEY_ACCESS_TOKEN);

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
