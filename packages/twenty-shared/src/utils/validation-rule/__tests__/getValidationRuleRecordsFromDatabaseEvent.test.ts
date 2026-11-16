import { type ObjectRecordEvent } from '@/database-events/object-record-event.event';
import { getValidationRuleRecordsFromDatabaseEvent } from '@/utils/validation-rule/getValidationRuleRecordsFromDatabaseEvent';

const BEFORE = { stage: 'MEETING' };
const AFTER = { stage: 'PROPOSAL' };

const buildEvent = (properties: Record<string, unknown>) =>
  ({ recordId: 'record-id', properties }) as unknown as ObjectRecordEvent;

describe('getValidationRuleRecordsFromDatabaseEvent', () => {
  it('should read a created record with nothing previous', () => {
    expect(
      getValidationRuleRecordsFromDatabaseEvent({
        event: buildEvent({ after: AFTER }),
        action: 'created',
      }),
    ).toEqual({ record: AFTER });
  });

  it('should read an updated record with the stored record as previous', () => {
    expect(
      getValidationRuleRecordsFromDatabaseEvent({
        event: buildEvent({ before: BEFORE, after: AFTER }),
        action: 'updated',
      }),
    ).toEqual({ record: AFTER, previousRecord: BEFORE });
  });

  it('should read an upsert that created the record with nothing previous', () => {
    expect(
      getValidationRuleRecordsFromDatabaseEvent({
        event: buildEvent({ after: AFTER }),
        action: 'upserted',
      }),
    ).toEqual({ record: AFTER, previousRecord: undefined });
  });

  it('should read a deleted record as it was before the deletion', () => {
    expect(
      getValidationRuleRecordsFromDatabaseEvent({
        event: buildEvent({
          before: BEFORE,
          after: { ...BEFORE, deletedAt: '2026-09-23' },
        }),
        action: 'deleted',
      }),
    ).toEqual({ record: BEFORE });
  });
});
