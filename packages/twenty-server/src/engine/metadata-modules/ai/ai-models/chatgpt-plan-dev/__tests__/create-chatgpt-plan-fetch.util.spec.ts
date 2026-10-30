import {
  adaptChatGptPlanRequestBody,
  createChatGptPlanFetch,
} from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/create-chatgpt-plan-fetch.util';

const RESPONSES_URL = 'https://api.openai.com/v1/responses';

const buildEventStream = (events: unknown[]): Response =>
  new Response(
    events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
  );

describe('adaptChatGptPlanRequestBody', () => {
  it('removes unsupported fields, forces unstored streaming and maps system to developer', () => {
    const adapted = adaptChatGptPlanRequestBody({
      model: 'gpt-6.1-sol',
      temperature: 0.2,
      max_output_tokens: 100,
      previous_response_id: 'resp_1',
      metadata: { a: 'b' },
      store: true,
      input: [
        { role: 'system', content: 'Be brief.' },
        { role: 'user', content: 'Hi' },
      ],
    });

    expect(adapted).toEqual({
      model: 'gpt-6.1-sol',
      store: false,
      stream: true,
      input: [
        { role: 'developer', content: 'Be brief.' },
        { role: 'user', content: 'Hi' },
      ],
    });
  });
});

describe('createChatGptPlanFetch', () => {
  const getAccessToken = jest.fn().mockResolvedValue('test-token');

  it('passes a streaming request through with the plan token', async () => {
    const streamResponse = buildEventStream([{ type: 'response.created' }]);
    const baseFetch = jest.fn().mockResolvedValue(streamResponse);
    const planFetch = createChatGptPlanFetch({ getAccessToken, baseFetch });

    const response = await planFetch(RESPONSES_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer placeholder' },
      body: JSON.stringify({ model: 'm', stream: true, temperature: 1 }),
    });

    expect(response).toBe(streamResponse);

    const [, init] = baseFetch.mock.calls[0];

    expect(new Headers(init.headers).get('Authorization')).toBe(
      'Bearer test-token',
    );
    expect(JSON.parse(init.body)).toEqual({
      model: 'm',
      stream: true,
      store: false,
    });
  });

  it('folds the stream into one JSON response for non-streaming callers', async () => {
    const messageItem = {
      type: 'message',
      role: 'assistant',
      content: [{ type: 'output_text', text: 'pong' }],
    };
    const baseFetch = jest.fn().mockResolvedValue(
      buildEventStream([
        { type: 'response.created' },
        { type: 'response.output_text.delta', delta: 'pong' },
        { type: 'response.output_item.done', item: messageItem },
        {
          type: 'response.completed',
          response: { id: 'resp_1', output: [], usage: { input_tokens: 3 } },
        },
      ]),
    );
    const planFetch = createChatGptPlanFetch({ getAccessToken, baseFetch });

    const response = await planFetch(RESPONSES_URL, {
      method: 'POST',
      body: JSON.stringify({ model: 'm' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 'resp_1',
      output: [messageItem],
      usage: { input_tokens: 3 },
    });
    expect(JSON.parse(baseFetch.mock.calls[0][1].body).stream).toBe(true);
  });

  it('turns a failed stream into an error response', async () => {
    const baseFetch = jest.fn().mockResolvedValue(
      buildEventStream([
        {
          type: 'response.failed',
          response: { error: { code: 'rate_limit', message: 'Slow down' } },
        },
      ]),
    );
    const planFetch = createChatGptPlanFetch({ getAccessToken, baseFetch });

    const response = await planFetch(RESPONSES_URL, {
      method: 'POST',
      body: JSON.stringify({ model: 'm' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'rate_limit', message: 'Slow down' },
    });
  });

  it('only adds the token to other routes', async () => {
    const baseFetch = jest.fn().mockResolvedValue(new Response('{}'));
    const planFetch = createChatGptPlanFetch({ getAccessToken, baseFetch });

    await planFetch('https://api.openai.com/v1/models', { method: 'GET' });

    const [url, init] = baseFetch.mock.calls[0];

    expect(url).toBe('https://api.openai.com/v1/models');
    expect(init.body).toBeUndefined();
  });
});
