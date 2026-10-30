import { isDefined } from 'twenty-shared/utils';

import { CHATGPT_PLAN_UNSUPPORTED_RESPONSES_FIELDS } from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/chatgpt-plan-dev-provider.const';

type FetchFunction = typeof fetch;

type ResponsesStreamEvent = {
  type: string;
  item?: unknown;
  response?: {
    output?: unknown[];
    error?: { code?: string; message?: string } | null;
    incomplete_details?: { reason?: string } | null;
    [key: string]: unknown;
  };
  code?: string;
  message?: string;
};

const getRequestUrl = (input: Parameters<FetchFunction>[0]): string => {
  if (typeof input === 'string') {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
};

// The plan route rejects several standard Responses fields and only serves
// unstored, streamed responses.
export const adaptChatGptPlanRequestBody = (
  body: Record<string, unknown>,
): Record<string, unknown> => {
  const adapted: Record<string, unknown> = { ...body };

  for (const field of CHATGPT_PLAN_UNSUPPORTED_RESPONSES_FIELDS) {
    delete adapted[field];
  }

  adapted.store = false;
  adapted.stream = true;

  if (Array.isArray(adapted.input)) {
    adapted.input = adapted.input.map((item: unknown) =>
      isDefined(item) &&
      typeof item === 'object' &&
      (item as { role?: string }).role === 'system'
        ? { ...item, role: 'developer' }
        : item,
    );
  }

  return adapted;
};

async function* readServerSentEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ResponsesStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex = buffer.indexOf('\n\n');

    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);

      buffer = buffer.slice(separatorIndex + 2);
      separatorIndex = buffer.indexOf('\n\n');

      const data = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');

      if (data.length > 0 && data !== '[DONE]') {
        yield JSON.parse(data) as ResponsesStreamEvent;
      }
    }
  }
}

const jsonResponse = (status: number, payload: unknown): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Callers such as title generation ask for a single JSON response, which the
// plan route refuses, so the stream is folded back into one. With store=false
// the completed event can omit output items, hence the streamed fallback.
export const aggregateChatGptPlanStream = async (
  streamResponse: Response,
): Promise<Response> => {
  if (!isDefined(streamResponse.body)) {
    return jsonResponse(502, {
      error: { message: 'Empty response from the ChatGPT plan route.' },
    });
  }

  const streamedOutputItems: unknown[] = [];

  for await (const event of readServerSentEvents(streamResponse.body)) {
    if (event.type === 'response.output_item.done') {
      streamedOutputItems.push(event.item);
    }

    if (event.type === 'response.completed' && isDefined(event.response)) {
      const completedOutput = event.response.output ?? [];

      return jsonResponse(200, {
        ...event.response,
        output:
          completedOutput.length > 0 ? completedOutput : streamedOutputItems,
      });
    }

    if (event.type === 'response.incomplete' && isDefined(event.response)) {
      return jsonResponse(200, {
        ...event.response,
        output: streamedOutputItems,
      });
    }

    if (event.type === 'response.failed') {
      return jsonResponse(400, {
        error: {
          code: event.response?.error?.code,
          message:
            event.response?.error?.message ??
            'The ChatGPT plan route failed the response.',
        },
      });
    }

    if (event.type === 'error') {
      return jsonResponse(400, {
        error: { code: event.code, message: event.message },
      });
    }
  }

  return jsonResponse(502, {
    error: { message: 'The ChatGPT plan stream ended before completion.' },
  });
};

export const createChatGptPlanFetch =
  ({
    getAccessToken,
    baseFetch = fetch,
  }: {
    getAccessToken: () => Promise<string>;
    baseFetch?: FetchFunction;
  }): FetchFunction =>
  async (input, init) => {
    const headers = new Headers(init?.headers);

    headers.set('Authorization', `Bearer ${await getAccessToken()}`);

    const url = getRequestUrl(input);

    if (!url.endsWith('/responses') || typeof init?.body !== 'string') {
      return baseFetch(input, { ...init, headers });
    }

    const requestBody = JSON.parse(init.body) as Record<string, unknown>;
    const callerRequestedStream = requestBody.stream === true;

    const response = await baseFetch(input, {
      ...init,
      headers,
      body: JSON.stringify(adaptChatGptPlanRequestBody(requestBody)),
    });

    if (callerRequestedStream || !response.ok) {
      return response;
    }

    return aggregateChatGptPlanStream(response);
  };
