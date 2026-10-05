import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { doesObjectRecordEventChangeFields } from 'src/modules/timeline/utils/does-object-record-event-change-fields.util';

const FIELD_NAMES = ['messageId', 'personId', 'workspaceMemberId'];

const buildEvent = ({
  updatedFields,
  diff,
}: {
  updatedFields?: string[];
  diff?: Record<string, unknown>;
}) =>
  ({
    recordId: 'junction-record-id',
    properties: { updatedFields, diff },
  }) as ObjectRecordBaseEvent<Record<string, unknown>>;

describe('doesObjectRecordEventChangeFields', () => {
  it('detects a watched field in the ORM updated fields', () => {
    expect(
      doesObjectRecordEventChangeFields({
        event: buildEvent({ updatedFields: ['message', 'messageId'] }),
        fieldNames: FIELD_NAMES,
      }),
    ).toBe(true);
  });

  it('supports events carrying only a diff', () => {
    expect(
      doesObjectRecordEventChangeFields({
        event: buildEvent({
          diff: { personId: { before: null, after: 'id' } },
        }),
        fieldNames: FIELD_NAMES,
      }),
    ).toBe(true);
  });

  it('ignores unrelated field changes', () => {
    expect(
      doesObjectRecordEventChangeFields({
        event: buildEvent({ updatedFields: ['handle'] }),
        fieldNames: FIELD_NAMES,
      }),
    ).toBe(false);
  });

  it('returns false when change metadata is absent', () => {
    expect(
      doesObjectRecordEventChangeFields({
        event: buildEvent({}),
        fieldNames: FIELD_NAMES,
      }),
    ).toBe(false);
  });
});
