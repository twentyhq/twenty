import { getDefaultMcpToolInputFromJsonSchema } from '@/workflow';

describe('getDefaultMcpToolInputFromJsonSchema', () => {
  it('seeds optional inputs with null and required ones with their default', () => {
    expect(
      getDefaultMcpToolInputFromJsonSchema({
        required: ['query', 'kinds', 'mode'],
        properties: {
          query: { type: 'string' },
          kinds: { type: 'array', items: { type: 'string' } },
          mode: { type: 'string', enum: ['fast', 'slow'] },
          tags: { type: 'array', items: { type: 'string' } },
          sort: { type: 'string', enum: ['asc', 'desc'] },
        },
      }),
    ).toEqual({
      query: null,
      kinds: [],
      mode: 'fast',
      tags: null,
      sort: null,
    });
  });

  it('seeds nested required values only under a required object', () => {
    const nestedObject = {
      type: 'object' as const,
      required: ['status'],
      properties: {
        status: { type: 'string' as const, enum: ['open', 'closed'] },
      },
    };

    expect(
      getDefaultMcpToolInputFromJsonSchema({
        required: ['sort'],
        properties: { filter: nestedObject, sort: nestedObject },
      }),
    ).toEqual({
      filter: { status: null },
      sort: { status: 'open' },
    });
  });
});
