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
  it('names the required arguments left empty', () => {
    expect(
      findMissingRequiredToolArguments({
        inputSchema: CALENDAR_EVENT_SCHEMA,
        toolArguments: { title: 'Kickoff', startsAt: '', location: 'Paris' },
      }),
    ).toEqual(['startsAt', 'endsAt']);
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
