import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { doesTimelineActivityLinkChange } from 'src/modules/timeline/utils/does-timeline-activity-link-change.util';

const JOIN_COLUMN_NAMES = ['messageId', 'personId', 'workspaceMemberId'];

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

describe('doesTimelineActivityLinkChange', () => {
  it('detects a join column in the ORM updated fields', () => {
    expect(
      doesTimelineActivityLinkChange({
        event: buildEvent({ updatedFields: ['message', 'messageId'] }),
        joinColumnNames: JOIN_COLUMN_NAMES,
      }),
    ).toBe(true);
  });

  it('supports events carrying only a diff', () => {
    expect(
      doesTimelineActivityLinkChange({
        event: buildEvent({
          diff: { personId: { before: null, after: 'id' } },
        }),
        joinColumnNames: JOIN_COLUMN_NAMES,
      }),
    ).toBe(true);
  });

  it('ignores unrelated field changes', () => {
    expect(
      doesTimelineActivityLinkChange({
        event: buildEvent({ updatedFields: ['handle'] }),
        joinColumnNames: JOIN_COLUMN_NAMES,
      }),
    ).toBe(false);
  });

  it('returns false when change metadata is absent', () => {
    expect(
      doesTimelineActivityLinkChange({
        event: buildEvent({}),
        joinColumnNames: JOIN_COLUMN_NAMES,
      }),
    ).toBe(false);
  });
});
