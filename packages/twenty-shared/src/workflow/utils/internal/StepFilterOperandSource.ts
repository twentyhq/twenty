import { type ValidationRuleDatabaseEventAction } from '@/types/ValidationRuleDatabaseEventAction';

// Trigger filters read the event's record; step filters read {{stepId.path}} variables
export type StepFilterOperandSource =
  | {
      type: 'TRIGGER_RECORD';
      databaseEventAction: ValidationRuleDatabaseEventAction;
    }
  | { type: 'WORKFLOW_VARIABLES' };
