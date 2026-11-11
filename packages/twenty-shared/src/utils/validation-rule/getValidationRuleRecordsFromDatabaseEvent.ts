import { type ObjectRecordEvent } from '@/database-events/object-record-event.event';
import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';

type ValidationRuleRecords = {
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
};

const ACTIONS_WITH_PREVIOUS_RECORD: ValidationRuleDatabaseEventAction[] = [
  'updated',
  'upserted',
  'restored',
];

const ACTIONS_READING_BEFORE: ValidationRuleDatabaseEventAction[] = [
  'deleted',
  'destroyed',
];

// A deleted record is read as it was before the deletion, with nothing previous to it
export const getValidationRuleRecordsFromDatabaseEvent = ({
  event,
  action,
}: {
  event: ObjectRecordEvent;
  action: ValidationRuleDatabaseEventAction;
}): ValidationRuleRecords => {
  const { before, after } = event.properties as {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };

  if (ACTIONS_READING_BEFORE.includes(action)) {
    return { record: before ?? {} };
  }

  return {
    record: after ?? {},
    ...(ACTIONS_WITH_PREVIOUS_RECORD.includes(action) && {
      previousRecord: before,
    }),
  };
};
