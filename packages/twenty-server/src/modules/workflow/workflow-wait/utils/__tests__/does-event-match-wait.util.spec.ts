import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { doesEventMatchWait } from 'src/modules/workflow/workflow-wait/utils/does-event-match-wait.util';

const buildUpdateEvent = ({
  recordId,
  updatedFields,
}: {
  recordId: string;
  updatedFields: string[];
}) =>
  ({
    recordId,
    properties: { before: {}, after: {}, updatedFields, diff: {} },
  }) as unknown as ObjectRecordEvent;

describe('doesEventMatchWait', () => {
  it('matches any record when the wait names none', () => {
    expect(
      doesEventMatchWait({
        wait: { type: 'EVENT', eventName: 'company.updated' },
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(true);
  });

  it('only matches the record the wait names', () => {
    const wait = {
      type: 'EVENT' as const,
      eventName: 'company.updated',
      recordId: 'a',
    };

    expect(
      doesEventMatchWait({
        wait,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(true);
    expect(
      doesEventMatchWait({
        wait,
        event: buildUpdateEvent({ recordId: 'b', updatedFields: ['name'] }),
      }),
    ).toBe(false);
  });

  it('only matches updates that changed one of the watched fields', () => {
    const wait = {
      type: 'EVENT' as const,
      eventName: 'company.updated',
      updatedFields: ['stage'],
    };

    expect(
      doesEventMatchWait({
        wait,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['stage'] }),
      }),
    ).toBe(true);
    expect(
      doesEventMatchWait({
        wait,
        event: buildUpdateEvent({ recordId: 'a', updatedFields: ['name'] }),
      }),
    ).toBe(false);
  });

  it('never matches a wait that is not on an event', () => {
    expect(
      doesEventMatchWait({
        wait: { type: 'TIME', resumeAt: new Date().toISOString() },
        event: buildUpdateEvent({ recordId: 'a', updatedFields: [] }),
      }),
    ).toBe(false);
  });
});
