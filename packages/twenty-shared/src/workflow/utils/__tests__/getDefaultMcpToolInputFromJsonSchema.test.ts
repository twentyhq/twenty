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
          limit: { type: 'number' },
        },
      }),
    ).toEqual({
      query: null,
      kinds: [],
      mode: 'fast',
      tags: null,
      sort: null,
      limit: null,
    });
  });

  it('keeps nested objects editable while their optional leaves stay null', () => {
    expect(
      getDefaultMcpToolInputFromJsonSchema({
        properties: {
          filter: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['open', 'closed'] },
              labels: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      }),
    ).toEqual({ filter: { status: 'open', labels: null } });
  });
});
