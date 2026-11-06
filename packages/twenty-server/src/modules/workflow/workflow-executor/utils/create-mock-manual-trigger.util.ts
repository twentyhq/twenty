import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const createMockManualTrigger = (): WorkflowManualTrigger => ({
  name: 'Launch manually',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
});
