import { randomUUID } from 'node:crypto';

import { followAgentRunEvents } from 'test/integration/ai/utils/follow-agent-run-events.util';
import { generateQueryFactory } from 'test/integration/ai/utils/generate-query-factory.util';
import {
  answerWith,
  mockScriptedAiModel,
} from 'test/integration/ai/utils/mock-scripted-ai-model.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const INPUT = [{ role: 'user' as const, content: 'Qualify Acme' }];

const setupApplicationWithToken = async (name: string) => {
  const application = await setupApplicationWithResources({ name });
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: application.id,
  });

  return { application, token: applicationAccessToken.token };
};

const waitFor = async (isDone: () => boolean, timeoutMs = 10_000) => {
  const startedAt = Date.now();

  while (!isDone()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error('Timed out waiting for the run stream');
    }

    await new Promise((resolve) => setTimeout(resolve, 20));
  }
};

const isRunEnd = ({ type }: AgentChatSubscriptionEvent) =>
  type === 'message-persisted' || type === 'stream-error';

describe('ai.generate runs followed by their application (integration)', () => {
  let application: ApplicationWithResources;
  let token: string;
  let otherApplication: ApplicationWithResources;
  let otherToken: string;

  beforeAll(async () => {
    [
      { application, token },
      { application: otherApplication, token: otherToken },
    ] = await Promise.all([
      setupApplicationWithToken('Generate Stream Probe'),
      setupApplicationWithToken('Generate Stream Other Probe'),
    ]);
  }, 120000);

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await Promise.all(
      [application, otherApplication]
        .filter(isDefined)
        .map(({ universalIdentifier }) =>
          cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: universalIdentifier,
          }),
        ),
    );
  });

  it('streams a run to its application under the run id it chose, and to no other application', async () => {
    const runId = randomUUID();
    const streams: Awaited<ReturnType<typeof followAgentRunEvents>>[] = [];

    try {
      const ownStream = await followAgentRunEvents({ runId, token });

      streams.push(ownStream);

      const otherStream = await followAgentRunEvents({
        runId,
        token: otherToken,
      });

      streams.push(otherStream);

      await waitFor(
        () => ownStream.events.length > 0 && otherStream.events.length > 0,
      );
      mockScriptedAiModel(() => answerWith('Acme looks like a fit'));

      const response = await makeMetadataApiRequest(
        generateQueryFactory({ input: INPUT, runId }),
        token,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.generate).toMatchObject({
        success: true,
        text: 'Acme looks like a fit',
        runId,
      });

      await waitFor(() => ownStream.events.some(isRunEnd));

      const chunks = ownStream.events.flatMap((event) =>
        event.type === 'stream-chunk' ? [event.chunk] : [],
      );

      expect(chunks[0]).toMatchObject({ type: 'start' });
      expect(
        chunks
          .filter(({ type }) => type === 'text-delta')
          .map(({ delta }) => delta)
          .join(''),
      ).toBe('Acme looks like a fit');
      expect(ownStream.events.find(isRunEnd)).toMatchObject({
        type: 'message-persisted',
      });
    } finally {
      await Promise.all(streams.map((stream) => stream.close()));
    }

    const [ownStream, otherStream] = streams;

    expect(ownStream.errors).toEqual([]);
    expect(otherStream.errors).toEqual([]);
    expect(otherStream.events.every(({ type }) => type === 'keepalive')).toBe(
      true,
    );
  });

  it('refuses a run id that is already used', async () => {
    const runId = randomUUID();

    mockScriptedAiModel(() => answerWith('Done'));

    const firstResponse = await makeMetadataApiRequest(
      generateQueryFactory({ input: INPUT, runId }),
      token,
    );

    expect(firstResponse.body.data.generate.runId).toBe(runId);

    const secondResponse = await makeMetadataApiRequest(
      generateQueryFactory({ input: INPUT, runId }),
      token,
    );

    expect(secondResponse.body.errors[0].extensions.code).toBe(
      'BAD_USER_INPUT',
    );
  });

  it('refuses a run id from a member session', async () => {
    const response = await makeMetadataApiRequest(
      generateQueryFactory({ input: INPUT, runId: randomUUID() }),
    );

    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  });
});
