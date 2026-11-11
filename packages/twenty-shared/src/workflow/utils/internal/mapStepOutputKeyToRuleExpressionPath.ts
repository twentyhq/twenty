import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';
import { isValidationRuleReservedName } from '@/utils/validation-rule/isValidationRuleReservedName';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';

type TriggerRecordSnapshot = 'after' | 'before';

type StepOutputKeyRuleExpressionPathMapping =
  | {
      isMapped: true;
      snapshot: TriggerRecordSnapshot;
      isPrevious: boolean;
      segments: string[];
    }
  | { isMapped: false; reason: string };

const TRIGGER_RECORD_VARIABLE_PATTERN = new RegExp(
  `^\\{\\{\\s*${TRIGGER_STEP_ID}\\.properties\\.(after|before)((?:\\.[A-Za-z_][A-Za-z0-9_]*)*)\\s*\\}\\}$`,
);

// The legacy resolver reads a trailing keyword as a literal, never as a key
const KEYWORD_SEGMENTS = ['true', 'false', 'null', 'undefined'];

const ACTIONS_READING_BEFORE: ValidationRuleDatabaseEventAction[] = [
  'deleted',
  'destroyed',
];

export const mapStepOutputKeyToRuleExpressionPath = ({
  stepOutputKey,
  databaseEventAction,
}: {
  stepOutputKey: string;
  databaseEventAction: ValidationRuleDatabaseEventAction;
}): StepOutputKeyRuleExpressionPathMapping => {
  const match = stepOutputKey.match(TRIGGER_RECORD_VARIABLE_PATTERN);

  if (match === null) {
    return {
      isMapped: false,
      reason: `"${stepOutputKey}" does not read the trigger record`,
    };
  }

  const snapshot: TriggerRecordSnapshot =
    match[1] === 'before' ? 'before' : 'after';
  const segments = (match[2] ?? '').split('.').filter(Boolean);

  const hasUnsupportedSegment = segments.some(
    (segment, index) =>
      KEYWORD_SEGMENTS.includes(segment) ||
      isValidationRuleReservedName({ name: segment, isMember: index > 0 }),
  );

  if (hasUnsupportedSegment) {
    return {
      isMapped: false,
      reason: `"${stepOutputKey}" uses a name reserved in rule expressions`,
    };
  }

  if (!ACTIONS_READING_BEFORE.includes(databaseEventAction)) {
    return {
      isMapped: true,
      snapshot,
      isPrevious: snapshot === 'before',
      segments,
    };
  }

  if (snapshot === 'after') {
    return {
      isMapped: false,
      reason: `"${stepOutputKey}" reads the record after a ${databaseEventAction} event`,
    };
  }

  return { isMapped: true, snapshot, isPrevious: false, segments };
};
