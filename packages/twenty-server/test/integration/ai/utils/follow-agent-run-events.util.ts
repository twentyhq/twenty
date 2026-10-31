import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

const ON_AGENT_RUN_EVENT_SUBSCRIPTION = `
  subscription OnAgentRunEvent($runId: UUID!) {
    onAgentChatEvent(runId: $runId) {
      event
    }
  }
`;

export const followAgentRunEvents = async ({
  runId,
  token,
}: {
  runId: string;
  token: string;
}) => {
  const abortController = new AbortController();
  const events: AgentChatSubscriptionEvent[] = [];
  const errors: string[] = [];

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
  });

  if (!isDefined(response.body)) {
    throw new Error(`The subscription failed with HTTP ${response.status}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

  const reading = (async () => {
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          return;
        }

        buffer += value;

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

          if (data.length === 0) {
            continue;
          }

          const result = JSON.parse(data);

          if (isDefined(result.errors)) {
            errors.push(
              ...result.errors.map(
                (error: { extensions?: { code?: string } }) =>
                  error.extensions?.code,
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
    close: async () => {
      abortController.abort();
      await reading;
    },
  };
};
