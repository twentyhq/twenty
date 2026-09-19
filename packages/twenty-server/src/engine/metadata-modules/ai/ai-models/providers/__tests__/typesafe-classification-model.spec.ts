import { TypeSafeClassificationModel } from 'src/engine/metadata-modules/ai/ai-models/providers/typesafe-classification-model';

const input = {
  text: 'Please refund the duplicate charge.',
  instructions: 'Choose the team responsible.',
  categories: [
    { label: 'billing', description: 'Payments and refunds' },
    { label: 'technical', description: 'Product bugs' },
  ],
};
const validResponse = () => ({
  model: 'jev-1.13.0',
  answers: {
    classification: {
      type: 'choice',
      choice: 'billing',
      confidence: 0.596,
      probabilities: { billing: 0.84, technical: 0.16 },
    },
  },
  usage: { input_tokens: 312, output_tokens: 48 },
});

describe('TypeSafeClassificationModel', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;
  const model = new TypeSafeClassificationModel('test-key', 'jev-1.13.0');

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => validResponse(),
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('maps category descriptions to a typed choice and preserves usage', async () => {
    const result = await model.classify(input);
    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBe('https://api.typesafe.ai/v1/systemone');
    expect(options.headers.Authorization).toBe('Bearer test-key');
    expect(options.redirect).toBe('error');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(options.body)).toEqual({
      model: 'jev-1.13.0',
      state: input.text,
      questions: {
        classification: {
          type: 'choice',
          instructions: input.instructions,
          criteria: {
            billing: 'Payments and refunds',
            technical: 'Product bugs',
          },
        },
      },
    });
    expect(result).toEqual({
      category: 'billing',
      probability: 0.84,
      probabilities: [
        { category: 'billing', probability: 0.84 },
        { category: 'technical', probability: 0.16 },
      ],
      resolvedModelId: 'jev-1.13.0',
      usage: { inputTokens: 312, outputTokens: 48 },
    });
  });

  it.each([
    { billing: -0.1, technical: 1.1 },
    { billing: 0.9, technical: 0.9 },
    { billing: 1 },
    { billing: 0.8, technical: 0.1, sales: 0.1 },
    { billing: 0.8, other: 0.2 },
  ])('rejects invalid distributions: %j', async (probabilities) => {
    const response = validResponse();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...response,
        answers: {
          classification: { ...response.answers.classification, probabilities },
        },
      }),
    });
    await expect(model.classify(input)).rejects.toThrow(/invalid/);
  });

  it('rejects an answer outside the declared categories', async () => {
    const response = validResponse();
    response.answers.classification.choice = 'sales';
    fetchMock.mockResolvedValue({ ok: true, json: async () => response });
    await expect(model.classify(input)).rejects.toThrow(
      'invalid category distribution',
    );
  });

  it('requires valid metering rather than silently charging zero', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ...validResponse(), usage: {} }),
    });
    await expect(model.classify(input)).rejects.toThrow(
      'invalid classification response',
    );
  });

  it('does not expose provider error bodies or retry outside the workflow policy', async () => {
    const json = jest.fn();
    fetchMock.mockResolvedValue({ ok: false, status: 429, json });
    await expect(model.classify(input)).rejects.toThrow('HTTP 429');
    expect(json).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects more than 255 categories before sending a request', async () => {
    await expect(
      model.classify({
        ...input,
        categories: Array.from({ length: 256 }, (_, index) => ({
          label: String(index),
          description: '',
        })),
      }),
    ).rejects.toThrow('at most 255');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propagates cancellation without manufacturing a category', async () => {
    fetchMock.mockRejectedValue(new DOMException('Timed out', 'TimeoutError'));
    await expect(model.classify(input)).rejects.toThrow('Timed out');
  });
});
