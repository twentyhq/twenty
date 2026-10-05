import { findMissingRequiredToolArguments } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/utils/find-missing-required-tool-arguments.util';

const CALENDAR_EVENT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    startsAt: { type: 'string' },
    endsAt: { type: 'string' },
    location: { type: 'string' },
  },
  required: ['title', 'startsAt', 'endsAt'],
};

describe('findMissingRequiredToolArguments', () => {
  it('names the required arguments that are absent, once each', () => {
    expect(
      findMissingRequiredToolArguments({
        inputSchema: {
          ...CALENDAR_EVENT_SCHEMA,
          required: [...CALENDAR_EVENT_SCHEMA.required, 'endsAt'],
        },
        toolArguments: { title: 'Kickoff', location: 'Paris' },
      }),
    ).toEqual(['startsAt', 'endsAt']);
  });

  it('leaves a present value, even null or empty, to the tool', () => {
    expect(
      findMissingRequiredToolArguments({
        inputSchema: CALENDAR_EVENT_SCHEMA,
        toolArguments: { title: '', startsAt: null, endsAt: '2026-07-01' },
      }),
    ).toEqual([]);
  });

  it('finds nothing missing without a schema', () => {
    expect(
      findMissingRequiredToolArguments({
        inputSchema: undefined,
        toolArguments: {},
      }),
    ).toEqual([]);
  });
});
