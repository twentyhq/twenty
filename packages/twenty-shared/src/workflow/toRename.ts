import { WorkflowAction } from '@/workflow/workflow-actions';
import { WorkflowTrigger } from '@/workflow/workflow-trigger';

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'DEACTIVATED';

export type WorkflowVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type WorkflowStep = WorkflowAction;

export type WorkflowStepType = WorkflowStep['type'];

type StepRunOutput = {
  id: string;
  name: string;
  type: string;
  outputs: {
    attemptCount: number;
    result: object | undefined;
    error: string | undefined;
  }[];
};

export type WorkflowRunOutput = {
  steps: Record<string, StepRunOutput>;
  error?: string;
};

export type WorkflowRun = {
  __typename: 'WorkflowRun';
  id: string;
  workflowVersionId: string;
  output: WorkflowRunOutput;
};

export type WorkflowVersion = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  workflowId: string;
  trigger: WorkflowTrigger | null;
  steps: Array<WorkflowStep> | null;
  status: WorkflowVersionStatus;
  __typename: 'WorkflowVersion';
};

export type Workflow = {
  __typename: 'Workflow';
  id: string;
  name: string;
  versions: Array<WorkflowVersion>;
  lastPublishedVersionId: string;
  statuses: Array<WorkflowStatus> | null;
};

export type WorkflowWithCurrentVersion = Workflow & {
  currentVersion: WorkflowVersion;
};
