import { Readable } from 'node:stream';

import { isNonEmptyString } from '@sniptt/guards';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const CONNECT_TIMEOUT_MS = 10_000;
const CLOSE_TIMEOUT_MS = 5_000;

const ON_AGENT_RUN_EVENT_SUBSCRIPTION = `
  subscription OnAgentRunEvent($runId: UUID!) {
    onAgentChatEvent(runId: $runId) {
      event
    }
  }
`;

export const followAgentRunEventsOrThrow = async ({
  runId,
  token,
}: {
  runId: string;
  token: string;
}) => {
  const abortController = new AbortController();
  const events: AgentChatSubscriptionEvent[] = [];
  const errors: string[] = [];

  const connectTimeout = setTimeout(
    () => abortController.abort(),
    CONNECT_TIMEOUT_MS,
  );

  const response = await fetch(`http://localhost:${APP_PORT}/metadata`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: ON_AGENT_RUN_EVENT_SUBSCRIPTION,
      variables: { runId },
    }),
    signal: abortController.signal,
  }).finally(() => clearTimeout(connectTimeout));

  // the integration setup swaps in node-fetch, whose body is a Node stream, not a web ReadableStream
  if (!response.ok || !(response.body instanceof Readable)) {
    abortController.abort();
    throw new Error(`The subscription failed with HTTP ${response.status}`);
  }

  const body = response.body;

  const reading = (async () => {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      for await (const chunk of body) {
        buffer += decoder.decode(chunk, { stream: true });

        let boundary = buffer.indexOf('\n\n');

        while (boundary !== -1) {
          const data = buffer
            .slice(0, boundary)
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice('data:'.length).trim())
            .join('\n');

          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf('\n\n');

          if (!isNonEmptyString(data)) {
            continue;
          }

          const result = JSON.parse(data);

          if (isDefined(result.errors)) {
            errors.push(
              ...result.errors.map(
                (error: { extensions?: { code?: string }; message?: string }) =>
                  error.extensions?.code ?? error.message,
              ),
            );
          } else {
            events.push(result.data.onAgentChatEvent.event);
          }
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        errors.push(String(error));
      }
    }
  })();

  return {
    events,
    errors,
    // an open stream keeps the test app from shutting down, so closing must not depend on the abort alone
    close: async () => {
      abortController.abort();
      body.destroy();

      let closeTimeout: ReturnType<typeof setTimeout> | undefined;

      await Promise.race([
        reading,
        new Promise((resolve) => {
          closeTimeout = setTimeout(resolve, CLOSE_TIMEOUT_MS);
        }),
      ]).finally(() => clearTimeout(closeTimeout));
    },
  };
};
